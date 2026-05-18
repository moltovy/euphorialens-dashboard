import fallbackPayload from "@/data/public-dashboard.json";
import { formatUsd } from "@/lib/format";
import type {
  ActivityPoint,
  CohortFilter,
  DistributionBucket,
  PnlDistributionPayload,
  PublicDashboardPayload,
  TraderRecord,
  WhaleMetric,
} from "@/lib/types";

export type DashboardData = {
  metadata: PublicDashboardPayload["metadata"];
  dataSource: "remote" | "fallback";
  asOfUtc: string;
  tradeUrl: string;
  xUrl: string;
  euphoriaUrl: string;
  traders: TraderRecord[];
  overviewSeries: ActivityPoint[];
  summary: PublicDashboardPayload["summary"];
  concentration: PublicDashboardPayload["concentration"];
  pnlDistribution?: PnlDistributionPayload | null;
  tapOutcomeDistribution: DistributionBucket[];
  tapCountDistribution: DistributionBucket[];
  settlementDistribution: DistributionBucket[];
  whaleTraders: TraderRecord[];
  largestTransfers: TraderRecord[];
  whaleMetrics: WhaleMetric[];
};

export const tradeUrl = "https://euphoria.finance/@impureidol564063";
export const xUrl = "https://x.com/Euphoria_fi";
export const euphoriaUrl = "https://euphoria.finance/@impureidol564063";

export function createDashboardData(
  payload: PublicDashboardPayload,
  dataSource: DashboardData["dataSource"] = "fallback",
): DashboardData {
  const normalizedOverview = payload.overviewSeries.map((point) => ({
    ...point,
    activityEvents: point.activityEvents ?? point.transferBets,
    settlements: point.settlements ?? point.settlementTransfers,
  }));

  const normalizedTraders = payload.traders.map((trader) => ({
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
  const leaderboardTraders = [...normalizedTraders].sort((a, b) => {
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

  const whaleTraders = [...normalizedTraders].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 20);
  const largestTransfers = [...normalizedTraders]
    .sort((a, b) => (b.largestSettlementUsd ?? b.largestTransferUsd) - (a.largestSettlementUsd ?? a.largestTransferUsd))
    .slice(0, 10);

  const whaleVolume = whaleTraders.reduce((sum, trader) => sum + trader.volumeUsd, 0);
  const summary = payload.summary;
  const concentration = payload.concentration;
  const whaleMetrics: WhaleMetric[] = [
    {
      label: "Top 10 volume share",
      value: `${Math.round(summary.top10VolumeSharePercent)}%`,
      detail: "Share of on-chain volume from the ten largest trader wallets.",
    },
    {
      label: "Top 20 volume",
      value: formatUsd(whaleVolume, { compact: true }),
      detail: "On-chain volume from the top 20 high-volume wallets.",
    },
    {
      label: "Top 25 share",
      value: `${Math.round(concentration?.top25VolumeSharePercent ?? summary.top10VolumeSharePercent)}%`,
      detail: "Share of on-chain volume from the top 25 trader wallets.",
    },
  ];

  return {
    metadata: payload.metadata,
    dataSource,
    asOfUtc: payload.metadata.generatedAt,
    tradeUrl,
    xUrl,
    euphoriaUrl,
    traders: leaderboardTraders,
    overviewSeries: normalizedOverview,
    summary,
    concentration,
    pnlDistribution: payload.pnlDistribution ?? null,
    tapOutcomeDistribution: payload.tapOutcomeDistribution ?? [],
    tapCountDistribution: payload.tapCountDistribution ?? [],
    settlementDistribution: payload.settlementDistribution ?? [],
    whaleTraders,
    largestTransfers,
    whaleMetrics,
  };
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
export const pnlDistribution = fallbackData.pnlDistribution;
export const tapOutcomeDistribution = fallbackData.tapOutcomeDistribution;
export const tapCountDistribution = fallbackData.tapCountDistribution;
export const settlementDistribution = fallbackData.settlementDistribution;
export const whaleTraders = fallbackData.whaleTraders;
export const largestTransfers = fallbackData.largestTransfers;
export const whaleMetrics = fallbackData.whaleMetrics;
export const fallbackDashboardData = fallbackData;
