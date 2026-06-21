import {
  createDashboardDataFromParts,
  createDashboardSummaryData,
  fallbackDashboardData,
  normalizeTraderRows,
  sortTraderRows,
  type DashboardData,
  type DashboardSummaryData,
} from "@/lib/dashboard-data";
import type {
  PublicDashboardManifest,
  PublicDashboardSummaryPayload,
  PublicTraderActivityShard,
  PublicTraderAddressMap,
  PublicTraderIndexShard,
  TraderRecord,
} from "@/lib/types";

const LEGACY_DATA_URL =
  process.env.EUPHORIA_PUBLIC_DASHBOARD_URL ??
  process.env.NEXT_PUBLIC_EUPHORIA_DASHBOARD_DATA_URL ??
  process.env.NEXT_PUBLIC_EUPHORIA_PUBLIC_DASHBOARD_URL;

const PUBLIC_DATA_BASE_URL = process.env.EUPHORIA_PUBLIC_DATA_BASE_URL ?? deriveBaseUrl(LEGACY_DATA_URL);

function deriveBaseUrl(url: string | undefined) {
  if (!url) return undefined;
  try {
    const parsed = new URL(url);
    parsed.pathname = parsed.pathname.replace(/public-dashboard\.json$/, "");
    parsed.search = "";
    parsed.hash = "";
    return parsed.toString();
  } catch {
    return url.replace(/public-dashboard\.json(?:\?.*)?$/, "");
  }
}

function resolvePublicUrl(path: string) {
  if (!PUBLIC_DATA_BASE_URL) return undefined;
  try {
    return new URL(path, PUBLIC_DATA_BASE_URL.endsWith("/") ? PUBLIC_DATA_BASE_URL : `${PUBLIC_DATA_BASE_URL}/`).toString();
  } catch {
    return undefined;
  }
}

async function fetchJson<T>(url: string | undefined): Promise<T | null> {
  if (!url) return null;
  try {
    const response = await fetch(url, {
      cache: "no-store",
      headers: { accept: "application/json" },
    });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } catch {
    return null;
  }
}

function hasSplitManifest(manifest: PublicDashboardManifest | null): manifest is PublicDashboardManifest {
  return Boolean(
    manifest?.split?.summary &&
      manifest.split.addressMap &&
      manifest.split.traderIndexShards?.length,
  );
}

async function getManifest() {
  const manifest = await fetchJson<PublicDashboardManifest>(resolvePublicUrl("manifest.json"));
  return hasSplitManifest(manifest) ? manifest : null;
}

function splitPath(manifest: PublicDashboardManifest, path: string) {
  if (path.startsWith("v3/")) return path;
  return `${manifest.split?.basePath ?? "v3/"}${path}`;
}

export async function getDashboardDataLegacy(): Promise<DashboardData> {
  return fallbackDashboardData;
}

export async function getDashboardSummary(): Promise<DashboardSummaryData> {
  const manifest = await getManifest();
  if (manifest) {
    const payload = await fetchJson<PublicDashboardSummaryPayload>(resolvePublicUrl(manifest.split!.summary));
    if (payload) return createDashboardSummaryData(payload, "remote", manifest);
  }
  return getDashboardDataLegacy();
}

export async function getTraderIndex(): Promise<TraderRecord[]> {
  const manifest = await getManifest();
  if (!manifest) {
    return (await getDashboardDataLegacy()).traders;
  }
  const shards = await Promise.all(
    manifest.split!.traderIndexShards.map((path) =>
      fetchJson<PublicTraderIndexShard>(resolvePublicUrl(path)),
    ),
  );
  if (shards.some((shard) => !shard)) {
    return (await getDashboardDataLegacy()).traders;
  }
  return sortTraderRows(normalizeTraderRows(shards.flatMap((shard) => shard?.rows ?? [])));
}

export async function getDashboardData(): Promise<DashboardData> {
  const manifest = await getManifest();
  if (!manifest) return getDashboardDataLegacy();

  const summaryPayload = await fetchJson<PublicDashboardSummaryPayload>(resolvePublicUrl(manifest.split!.summary));
  const shards = await Promise.all(
    manifest.split!.traderIndexShards.map((path) =>
      fetchJson<PublicTraderIndexShard>(resolvePublicUrl(path)),
    ),
  );
  if (!summaryPayload || shards.some((shard) => !shard)) {
    return getDashboardDataLegacy();
  }
  const base = createDashboardSummaryData(summaryPayload, "remote", manifest);
  return createDashboardDataFromParts(base, shards.flatMap((shard) => shard?.rows ?? []));
}

export async function getTraderProfile(address: string): Promise<(DashboardSummaryData & { trader: TraderRecord }) | null> {
  const normalized = address.toLowerCase();
  const manifest = await getManifest();

  if (manifest) {
    const [base, addressMap] = await Promise.all([
      getDashboardSummary(),
      fetchJson<PublicTraderAddressMap>(resolvePublicUrl(manifest.split!.addressMap)),
    ]);
    const entry = addressMap?.addresses?.[normalized];
    if (entry) {
      const [indexShard, activityShard] = await Promise.all([
        fetchJson<PublicTraderIndexShard>(resolvePublicUrl(splitPath(manifest, entry.indexShard))),
        fetchJson<PublicTraderActivityShard>(resolvePublicUrl(splitPath(manifest, entry.activityShard))),
      ]);
      const row = indexShard?.rows.find((trader) => trader.address.toLowerCase() === normalized);
      if (row) {
        const activity = activityShard?.rows.find((record) => record.address.toLowerCase() === normalized)?.activity ?? [];
        return { ...base, trader: normalizeTraderRows([{ ...row, activity }])[0] };
      }
    }
  }

  const legacy = await getDashboardDataLegacy();
  const trader = legacy.traders.find(
    (row) => row.address.toLowerCase() === normalized || row.shortAddress.toLowerCase() === normalized,
  );
  return trader ? { ...legacy, trader } : null;
}

export async function getTopProfileAddresses(limit = 50) {
  const manifest = await getManifest();
  if (manifest?.split?.topProfileAddresses?.length) {
    return manifest.split.topProfileAddresses.slice(0, limit);
  }
  const summary = await getDashboardSummary();
  return summary.leaderboardPreviewRows.slice(0, limit).map((trader) => trader.address);
}
