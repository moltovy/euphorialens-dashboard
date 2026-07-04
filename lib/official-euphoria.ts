import "server-only";

import type {
  OfficialLeaderboardData,
  OfficialLeaderboardMetric,
  OfficialLeaderboardRow,
  OfficialLeaderboardWindow,
  OfficialTradingStats,
} from "@/lib/types";

const DEFAULT_OFFICIAL_API_BASE_URL = "https://api.mainnet.euphoria.finance";
const DEFAULT_AVATAR_BASE_URL = "https://avatar.mainnet.euphoria.finance/";

const OFFICIAL_API_BASE_URL =
  process.env.EUPHORIA_OFFICIAL_API_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_OFFICIAL_API_BASE_URL;
const OFFICIAL_LEADERBOARD_MIRROR_URL = process.env.EUPHORIA_OFFICIAL_LEADERBOARD_URL;
const OFFICIAL_AVATAR_BASE_URL =
  process.env.EUPHORIA_OFFICIAL_AVATAR_BASE_URL?.replace(/\/$/, "") ?? DEFAULT_AVATAR_BASE_URL.replace(/\/$/, "");
const OFFICIAL_FETCH_TIMEOUT_MS = Number(process.env.EUPHORIA_OFFICIAL_FETCH_TIMEOUT_MS ?? 5000);
const OFFICIAL_REVALIDATE_SECONDS = Number(process.env.EUPHORIA_OFFICIAL_REVALIDATE_SECONDS ?? 300);

type RawLeaderboardEntry = {
  username?: string | null;
  displayName?: string | null;
  avatarObjectKey?: string | null;
  value?: string | number | null;
  rank?: number | null;
};

type RawTradingStats = {
  tradeCount?: string | number | null;
  volume?: string | number | null;
  volumeUsd?: string | number | null;
};

type LeaderboardRequest = {
  timeWindow?: OfficialLeaderboardWindow;
  metric?: OfficialLeaderboardMetric;
};

function officialNow() {
  return new Date().toISOString();
}

function officialFetchOptions(signal: AbortSignal): RequestInit {
  const cacheOptions: RequestInit =
    Number.isFinite(OFFICIAL_REVALIDATE_SECONDS) && OFFICIAL_REVALIDATE_SECONDS > 0
      ? { next: { revalidate: OFFICIAL_REVALIDATE_SECONDS } }
      : { cache: "no-store" };

  return {
    ...cacheOptions,
    signal,
    headers: {
      accept: "application/json",
      "content-type": "application/json",
      origin: "https://euphoria.finance",
      referer: "https://euphoria.finance/leaderboard",
    },
  };
}

async function fetchWithTimeout(url: string, init: RequestInit = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OFFICIAL_FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal,
    });
  } finally {
    clearTimeout(timeout);
  }
}

function buildTrpcQueryUrl(procedure: string, input: unknown) {
  const payload = { "0": { json: input } };
  const url = new URL(`${OFFICIAL_API_BASE_URL}/${procedure}`);
  url.searchParams.set("batch", "1");
  url.searchParams.set("input", JSON.stringify(payload));
  return url.toString();
}

function parseNumber(value: string | number | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : null;
  if (typeof value !== "string") return null;
  const parsed = Number(value.replace(/[$,+\s]/g, ""));
  return Number.isFinite(parsed) ? parsed : null;
}

function formatOfficialUsd(value: number, metric: OfficialLeaderboardMetric) {
  const abs = Math.abs(value);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(abs);
  if (metric === "pnl" && value > 0) return `+${formatted}`;
  if (value < 0) return `-${formatted}`;
  return formatted;
}

function avatarUrl(avatarObjectKey: string | null | undefined) {
  if (!avatarObjectKey) return null;
  try {
    return new URL(avatarObjectKey, `${OFFICIAL_AVATAR_BASE_URL}/`).toString();
  } catch {
    return null;
  }
}

function extractTrpcPayload(payload: unknown): unknown {
  const first = Array.isArray(payload) ? payload[0] : payload;
  if (!first || typeof first !== "object") return first;

  const record = first as Record<string, unknown>;
  const error = record.error as Record<string, unknown> | undefined;
  if (error) {
    const json = error.json as Record<string, unknown> | undefined;
    const message = json?.message ?? error.message ?? "Official Euphoria API returned an error.";
    throw new Error(String(message));
  }

  const result = record.result as Record<string, unknown> | undefined;
  if (result?.data && typeof result.data === "object") {
    const data = result.data as Record<string, unknown>;
    return data.json ?? data;
  }

  if ("json" in record) return record.json;
  return first;
}

function normalizeLeaderboardPayload(
  payload: unknown,
  metric: OfficialLeaderboardMetric,
  timeWindow: OfficialLeaderboardWindow,
): OfficialLeaderboardRow[] {
  const data = extractTrpcPayload(payload) as Record<string, unknown> | undefined;
  const entries =
    data && Array.isArray(data.entries)
      ? data.entries
      : Array.isArray(data)
        ? data
        : [];

  return entries
    .map((entry, index): OfficialLeaderboardRow | null => {
      const raw = entry as RawLeaderboardEntry;
      const valueUsd = parseNumber(raw.value);
      const username = raw.username?.trim() ?? "";
      const displayName = raw.displayName?.trim() || username || "Unknown trader";
      if (valueUsd == null || !username) return null;
      return {
        rank: typeof raw.rank === "number" && raw.rank > 0 ? raw.rank : index + 1,
        displayName,
        username,
        avatarObjectKey: raw.avatarObjectKey ?? null,
        avatarUrl: avatarUrl(raw.avatarObjectKey),
        valueUsd,
        valueDisplay: formatOfficialUsd(valueUsd, metric),
        metric,
        timeWindow,
        source: "official_euphoria_app" as const,
      };
    })
    .filter((row): row is OfficialLeaderboardRow => row != null);
}

function normalizeTradingStatsPayload(payload: unknown): OfficialTradingStats | null {
  const data = extractTrpcPayload(payload) as RawTradingStats | undefined;
  if (!data || typeof data !== "object") return null;
  return {
    tradeCount: parseNumber(data.tradeCount),
    volumeUsd: parseNumber(data.volumeUsd ?? data.volume),
    generatedAt: officialNow(),
    source: "official_euphoria_app",
  };
}

async function fetchOfficialProcedure(procedure: string, input: unknown) {
  const url = buildTrpcQueryUrl(procedure, input);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), OFFICIAL_FETCH_TIMEOUT_MS);
  try {
    const response = await fetch(url, officialFetchOptions(controller.signal));
    const text = await response.text();
    if (!response.ok) {
      throw new Error(`${response.status} ${response.statusText}`);
    }
    return JSON.parse(text) as unknown;
  } finally {
    clearTimeout(timeout);
  }
}

async function fetchOfficialMirror(
  metric: OfficialLeaderboardMetric,
  timeWindow: OfficialLeaderboardWindow,
): Promise<OfficialLeaderboardData | null> {
  if (!OFFICIAL_LEADERBOARD_MIRROR_URL) return null;
  const response = await fetchWithTimeout(OFFICIAL_LEADERBOARD_MIRROR_URL, {
    headers: { accept: "application/json" },
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`${response.status} ${response.statusText}`);
  const payload = (await response.json()) as OfficialLeaderboardData | unknown;
  const maybeData = payload as OfficialLeaderboardData;
  if (maybeData?.source === "official_euphoria_app" && Array.isArray(maybeData.rows)) {
    return {
      ...maybeData,
      metric,
      timeWindow,
      generatedAt: maybeData.generatedAt ?? officialNow(),
      rows: maybeData.rows.filter((row) => row.metric === metric && row.timeWindow === timeWindow),
    };
  }
  return {
    status: "ok",
    source: "official_euphoria_app",
    sourceUrl: OFFICIAL_LEADERBOARD_MIRROR_URL,
    metric,
    timeWindow,
    generatedAt: officialNow(),
    rows: normalizeLeaderboardPayload(payload, metric, timeWindow),
    staleReason: null,
  };
}

export async function getOfficialLeaderboard({
  timeWindow = "all",
  metric = "payouts",
}: LeaderboardRequest = {}): Promise<OfficialLeaderboardData> {
  try {
    const mirror = await fetchOfficialMirror(metric, timeWindow);
    if (mirror) return mirror;

    const leaderboardPayload = await fetchOfficialProcedure("leaderboard.getLeaderboard", { timeWindow, metric });
    const tradingStatsPayload = await fetchOfficialProcedure("trades.tradingStats", {}).catch(() => null);
    const rows = normalizeLeaderboardPayload(leaderboardPayload, metric, timeWindow);
    return {
      status: rows.length ? "ok" : "unavailable",
      source: "official_euphoria_app",
      sourceUrl: `${OFFICIAL_API_BASE_URL}/leaderboard.getLeaderboard`,
      metric,
      timeWindow,
      generatedAt: officialNow(),
      rows,
      tradingStats: tradingStatsPayload ? normalizeTradingStatsPayload(tradingStatsPayload) : null,
      staleReason: rows.length ? null : "empty_official_response",
    };
  } catch (error) {
    return {
      status: "unavailable",
      source: "official_euphoria_app",
      sourceUrl: OFFICIAL_LEADERBOARD_MIRROR_URL ?? `${OFFICIAL_API_BASE_URL}/leaderboard.getLeaderboard`,
      metric,
      timeWindow,
      generatedAt: officialNow(),
      rows: [],
      tradingStats: null,
      error: error instanceof Error ? error.message : String(error),
      staleReason: "official_fetch_failed",
    };
  }
}
