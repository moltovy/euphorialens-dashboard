import fallbackPayload from "@/data/public-dashboard.json";
import { formatUsd } from "@/lib/format";
import type {
  ActivityPoint,
  CohortFilter,
  ConcentrationCurvePoint,
  DistributionBucket,
  PnlDistributionPayload,
  PublicDashboardManifest,
  PublicDashboardPayload,
  PublicDashboardSummaryPayload,
  TraderRecord,
  WhaleMetric,
} from "@/lib/types";

export type DashboardSummaryData = {
  metadata: PublicDashboardSummaryPayload["metadata"];
  dataSource: "remote" | "fallback";
  manifest?: PublicDashboardManifest | null;
  asOfUtc: string;
  tradeUrl: string;
  xUrl: string;
  euphoriaUrl: string;
  leaderboardPreviewRows: TraderRecord[];
  overviewSeries: ActivityPoint[];
  summary: PublicDashboardSummaryPayload["summary"];
  concentration: PublicDashboardSummaryPayload["concentration"];
  concentrationCurve: ConcentrationCurvePoint[];
  pnlDistribution?: PnlDistributionPayload | null;
  tapOutcomeDistribution: DistributionBucket[];
  tapCountDistribution: DistributionBucket[];
  settlementDistribution: DistributionBucket[];
  whaleMetrics: WhaleMetric[];
};

export type DashboardData = DashboardSummaryData & {
  traders: TraderRecord[];
  whaleTraders: TraderRecord[];
  largestTransfers: TraderRecord[];
};

export const tradeUrl = "https://euphoria.finance/@impureidol564063";
export const xUrl = "https://x.com/Euphoria_fi";
export const euphoriaUrl = "https://euphoria.finance/@impureidol564063";

function normalizeOverview(rows: ActivityPoint[] = []) {
  return rows.map((point) => ({
    ...point,
    activityEvents: point.activityEvents ?? point.transferBets,
    settlements: point.settlements ?? point.settlementTransfers,
  }));
}

export function normalizeTraderRows(rows: TraderRecord[] = []) {
  return rows.map((trader) => ({
    ...trader,
    pnlUsd: trader.accountPnlUsd ?? trader.pnlUsd ?? null,
    accountPnlUsd: trader.accountPnlUsd ?? trader.pnlUsd ?? null,
    leaderboardPayoutUsd: trader.leaderboardPayoutUsd ?? trader.estimatedLeaderboardPnlUsd ?? null,
    activityEvents: trader.activityEvents ?? trader.transferBets,
    settlements: trader.settlements ?? trader.settlementTransfers,
    largestBetUsd: trader.largestBetUsd ?? null,
    largestPlatformPayoutUsd: trader.largestPlatformPayoutUsd ?? trader.largestSettlementUsd ?? trader.largestTransferUsd,
    largestSettlementUsd: trader.largestSettlementUsd ?? trader.largestPlatformPayoutUsd ?? trader.largestTransferUsd,
  }));
}

export function sortTraderRows(rows: TraderRecord[]) {
  return [...rows].sort((a, b) => {
    const pnlA = a.accountPnlUsd ?? a.pnlUsd;
    const pnlB = b.accountPnlUsd ?? b.pnlUsd;
    if (typeof pnlA === "number" && Number.isFinite(pnlA) && typeof pnlB === "number" && Number.isFinite(pnlB)) {
      return pnlB - pnlA;
    }
    if (typeof pnlA === "number" && Number.isFinite(pnlA)) {
      return -1;
    }
    if (typeof pnlB === "number" && Number.isFinite(pnlB)) {
      return 1;
    }
    return b.volumeUsd - a.volumeUsd;
  });
}

function buildWhaleMetrics(
  summary: PublicDashboardSummaryPayload["summary"],
  concentration: PublicDashboardSummaryPayload["concentration"],
  whaleTraders: TraderRecord[],
) {
  const whaleVolume = whaleTraders.reduce((sum, trader) => sum + trader.volumeUsd, 0);
  const top10Share = summary.top10VolumeSharePercent ?? concentration?.top10VolumeSharePercent ?? 0;
  return [
    {
      label: "Top 10 volume share",
      value: `${Math.round(top10Share)}%`,
      detail: "Share of on-chain volume from the ten largest trading accounts.",
    },
    {
      label: "Top 20 volume",
      value: formatUsd(whaleVolume, { compact: true }),
      detail: "On-chain volume from the top 20 high-volume accounts.",
    },
    {
      label: "Top 25 share",
      value: `${Math.round(concentration?.top25VolumeSharePercent ?? summary.top25VolumeSharePercent ?? top10Share)}%`,
      detail: "Share of on-chain volume from the top 25 trading accounts.",
    },
  ];
}

export function createDashboardSummaryData(
  payload: PublicDashboardSummaryPayload,
  dataSource: DashboardSummaryData["dataSource"] = "fallback",
  manifest?: PublicDashboardManifest | null,
): DashboardSummaryData {
  const previewRows = sortTraderRows(normalizeTraderRows(payload.leaderboardPreviewRows ?? payload.traders ?? []));
  const whalePreviewRows = [...previewRows].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 20);
  const summary = payload.summary;
  const concentration = payload.concentration;

  return {
    metadata: payload.metadata,
    dataSource,
    manifest,
    asOfUtc: payload.metadata.generatedAt,
    tradeUrl,
    xUrl,
    euphoriaUrl,
    leaderboardPreviewRows: previewRows,
    overviewSeries: normalizeOverview(payload.overviewSeries),
    summary,
    concentration,
    concentrationCurve: payload.concentrationCurve ?? [],
    pnlDistribution: payload.pnlDistribution ?? null,
    tapOutcomeDistribution: payload.tapOutcomeDistribution ?? [],
    tapCountDistribution: payload.tapCountDistribution ?? [],
    settlementDistribution: payload.settlementDistribution ?? [],
    whaleMetrics: buildWhaleMetrics(summary, concentration, whalePreviewRows),
  };
}

export function createDashboardDataFromParts(base: DashboardSummaryData, traders: TraderRecord[]): DashboardData {
  const leaderboardTraders = sortTraderRows(normalizeTraderRows(traders));
  const whaleTraders = [...leaderboardTraders].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 20);
  const largestTransfers = [...leaderboardTraders]
    .sort((a, b) => (b.largestSettlementUsd ?? b.largestTransferUsd) - (a.largestSettlementUsd ?? a.largestTransferUsd))
    .slice(0, 10);

  return {
    ...base,
    traders: leaderboardTraders,
    whaleTraders,
    largestTransfers,
  };
}

export function createDashboardData(
  payload: PublicDashboardPayload,
  dataSource: DashboardData["dataSource"] = "fallback",
  manifest?: PublicDashboardManifest | null,
): DashboardData {
  const base = createDashboardSummaryData(
    {
      ...payload,
      leaderboardPreviewRows: payload.leaderboardPreviewRows ?? payload.traders.slice(0, 50),
    },
    dataSource,
    manifest,
  );
  return createDashboardDataFromParts(base, payload.traders);
}

export function findTrader(address: string) {
  const normalized = address.toLowerCase();
  return traders.find(
    (trader) =>
      trader.address.toLowerCase() === normalized || trader.shortAddress.toLowerCase() === normalized,
  );
}

export function filterTraders(rows: TraderRecord[], query: string, cohort: CohortFilter) {
  const needle = query.trim().toLowerCase();
  return rows.filter((row) => {
    const matchesQuery =
      !needle ||
      row.address.toLowerCase().includes(needle) ||
      row.shortAddress.toLowerCase().includes(needle);
    const matchesCohort = cohort === "all" || row.cohorts.includes(cohort);
    return matchesQuery && matchesCohort;
  });
}

const fallbackData = createDashboardData(fallbackPayload as PublicDashboardPayload);

export const metadata = fallbackData.metadata;
export const asOfUtc = fallbackData.asOfUtc;
export const traders = fallbackData.traders;
export const overviewSeries = fallbackData.overviewSeries;
export const summary = fallbackData.summary;
export const concentration = fallbackData.concentration;
export const concentrationCurve = fallbackData.concentrationCurve;
export const pnlDistribution = fallbackData.pnlDistribution;
export const tapOutcomeDistribution = fallbackData.tapOutcomeDistribution;
export const tapCountDistribution = fallbackData.tapCountDistribution;
export const settlementDistribution = fallbackData.settlementDistribution;
export const whaleTraders = fallbackData.whaleTraders;
export const largestTransfers = fallbackData.largestTransfers;
export const whaleMetrics = fallbackData.whaleMetrics;
export const fallbackDashboardData = fallbackData;
