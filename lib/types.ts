export type TraderCohort =
  | "whale"
  | "high-volume"
  | "recent-active"
  | "grinder";

export type CohortFilter = "all" | TraderCohort;

export type ActivityPoint = {
  date: string;
  volumeUsd: number;
  activityEvents?: number;
  settlements?: number;
  transferBets: number;
  settlementTransfers: number;
  activeTraders: number;
  newTraders: number;
  cumulativeVolumeUsd: number;
  whaleSharePercent: number;
};

export type ConcentrationCurvePoint = {
  rank: number;
  address?: string;
  shortAddress: string;
  volumeUsd?: number;
  cumulativeSharePercent: number;
};

export type TraderActivityPoint = {
  date: string;
  volumeUsd: number;
  activityEvents?: number;
  settlements?: number;
  transferBets: number;
  settlementTransfers: number;
  cumulativeVolumeUsd: number;
};

export type TraderRecord = {
  rank: number;
  volumeRank?: number;
  address: string;
  shortAddress: string;
  volumeUsd: number;
  pnlUsd?: number | null;
  accountPnlUsd?: number | null;
  estimatedLeaderboardPnlUsd?: number | null;
  leaderboardPayoutUsd?: number | null;
  estimatedLeaderboardPnlRank?: number | null;
  estimatedLeaderboardPnlFormula?: string | null;
  winCount?: number;
  lossCount?: number;
  winRatePercent?: number | null;
  transferRows: number;
  activityEvents?: number;
  transferBets: number;
  settlements?: number;
  settlementTransfers: number;
  largestBetUsd?: number | null;
  largestPlatformPayoutUsd?: number | null;
  largestSettlementUsd?: number;
  largestTransferUsd: number;
  firstSeen: string;
  lastActive: string;
  firstSeenAt?: string;
  lastActiveAt?: string;
  cohorts: TraderCohort[];
  activity: TraderActivityPoint[];
};

export type OfficialLeaderboardMetric = "payouts" | "pnl";

export type OfficialLeaderboardWindow = "all" | "1d" | "7d" | "30d";

export type OfficialLeaderboardRow = {
  rank: number;
  displayName: string;
  username: string;
  avatarObjectKey?: string | null;
  avatarUrl?: string | null;
  valueUsd: number;
  valueDisplay: string;
  metric: OfficialLeaderboardMetric;
  timeWindow: OfficialLeaderboardWindow;
  source: "official_euphoria_app";
};

export type OfficialTradingStats = {
  tradeCount: number | null;
  volumeUsd: number | null;
  generatedAt: string;
  source: "official_euphoria_app";
};

export type OfficialLeaderboardData = {
  status: "ok" | "unavailable";
  source: "official_euphoria_app";
  sourceUrl: string;
  metric: OfficialLeaderboardMetric;
  timeWindow: OfficialLeaderboardWindow;
  generatedAt: string;
  rows: OfficialLeaderboardRow[];
  tradingStats?: OfficialTradingStats | null;
  error?: string;
  staleReason?: string | null;
};

export type WhaleMetric = {
  label: string;
  value: string;
  detail: string;
};

export type PublicDashboardMetadata = {
  generatedAt: string;
  source: string;
  network: string;
  rowCount: number;
  minBlock: number | null;
  maxBlock: number | null;
  firstSeenAt?: string | null;
  lastSeenAt?: string | null;
  minTimestamp?: string | null;
  maxTimestamp?: string | null;
  analysisDataThrough?: string | null;
  dashboardRefreshAgeSeconds?: number | null;
  onchainDataLagSeconds?: number | null;
  freshnessStatus?: "live" | "catching_up" | "stale" | "unknown" | string | null;
  freshnessLabel?: string | null;
  freshnessNotes?: string[];
  sourceTimestampSemantics?: Record<string, string>;
  pnlAvailable: boolean;
  pnlMetricKind?: string | null;
  netTraderPnlAvailable?: boolean;
  realWalletPnlAvailable?: boolean;
  pnlFormula?: string | null;
  pnlMethodology?: string | null;
  leaderboardPayoutAvailable?: boolean;
  leaderboardPayoutFormula?: string | null;
  leaderboardPayoutMethodology?: string | null;
  pnlPublicDecision?: string | null;
  platformScoreCandidateAvailable?: boolean;
  identityModelStatus?: string;
  platformScoreStatus?: string;
  realWalletPnlStatus?: string;
  lossDecodeStatus?: string;
  txSignerCount?: number;
  platformTraderAddressCount?: number;
  cashflowWalletCount?: number;
  lifecycleMatchedPositionCount?: number;
  leaderboardValidationStatus?: string;
  pnlValidationStatus?: string;
  platformAccountWinRateAvailable?: boolean;
  backfillComplete: boolean;
  legacyTransferCursorComplete?: boolean;
  rawTxReceiptComplete?: boolean;
  receiptLogCoverageComplete?: boolean;
  lifecycleDecodeComplete?: boolean;
  publicGoldFresh?: boolean;
  candidateTxHashes?: number | null;
  rawTransactionsAvailable?: number | null;
  rawReceiptsAvailable?: number | null;
  missingRawTransactions?: number | null;
  missingRawReceipts?: number | null;
  receiptLogRowsWritten?: number | null;
  blockTimestampCoveragePercent?: number | null;
  dataQualityNotes?: string[];
  notes: string[];
};

export type PublicDashboardSummary = {
  totalVolumeUsd: number;
  volumeUsd?: number;
  accountPnlUsd?: number | null;
  totalAccountPnlUsd?: number | null;
  topAccountPnlUsd?: number | null;
  estimatedLeaderboardPnlUsd?: number | null;
  totalEstimatedLeaderboardPnlUsd?: number | null;
  topEstimatedLeaderboardPnlUsd?: number | null;
  leaderboardPayoutUsd?: number | null;
  totalLeaderboardPayoutUsd?: number | null;
  topLeaderboardPayoutUsd?: number | null;
  totalTraders: number;
  indexedTraders?: number;
  tradingAccounts?: number;
  publishedTraderRows?: number;
  txSignerCount?: number;
  platformTraderAddressCount?: number;
  cashflowWalletCount?: number;
  lifecycleMatchedPositionCount?: number;
  transferRows: number;
  indexedEvents?: number;
  activityEvents?: number;
  indexedActivity?: number;
  transferBets: number;
  settlements?: number;
  settlementTransfers: number;
  activeWallets: number;
  activeTraders?: number;
  largestTransferUsd: number;
  largestSettlementUsd?: number;
  largestPlatformPayoutUsd?: number | null;
  largestBetUsd?: number | null;
  platformAccountWinRatePercent?: number | null;
  averageBetsPerWallet: number;
  averageActivityPerTrader?: number;
  top10VolumeSharePercent: number;
  top25VolumeSharePercent?: number;
  pnlAvailable: boolean;
};

export type ConcentrationMetrics = {
  top10VolumeSharePercent: number;
  top25VolumeSharePercent: number;
  giniCoefficient: number;
  hhi: number;
  walletsAbove1kVolume: number;
  walletsAbove5kVolume: number;
  walletsAbove10kVolume: number;
};

export type DistributionBucket = {
  label: string;
  count: number;
  percent?: number;
  tone?: "loss" | "profit";
};

export type PnlDistributionPayload = {
  buckets: Array<DistributionBucket & { percent: number; tone: "loss" | "profit" }>;
  stats: {
    traderCount: number;
    averagePnlUsd: number | null;
    medianPnlUsd: number | null;
    avgWinRatePercent: number | null;
    avgTapsPerTrader: number | null;
    averageBetUsd: number | null;
    bestTrader?: { address: string; value: number } | null;
    worstTrader?: { address: string; value: number } | null;
    profitSharePercent: number;
    lossSharePercent: number;
  };
};

export type PublicDashboardPayload = {
  schemaVersion: number;
  metadata: PublicDashboardMetadata;
  summary: PublicDashboardSummary;
  concentration?: ConcentrationMetrics;
  pnlDistribution?: PnlDistributionPayload | null;
  tapOutcomeDistribution?: DistributionBucket[];
  tapCountDistribution?: DistributionBucket[];
  concentrationCurve?: ConcentrationCurvePoint[];
  leaderboardPreviewRows?: TraderRecord[];
  topProfileAddresses?: string[];
  traders: TraderRecord[];
  leaderboard?: TraderRecord[];
  overviewSeries: ActivityPoint[];
  settlementDistribution?: DistributionBucket[];
};

export type PublicDashboardSummaryPayload = Omit<PublicDashboardPayload, "traders" | "leaderboard"> & {
  traders?: TraderRecord[];
  leaderboard?: TraderRecord[];
  leaderboardPreviewRows?: TraderRecord[];
  topProfileAddresses?: string[];
};

export type PublicDashboardManifestFile = {
  path: string;
  objectKey: string;
  kind: string;
  bytes: number;
  sha256?: string;
  rowCount?: number | null;
};

export type PublicDashboardManifest = {
  schemaVersion: number;
  legacySchemaVersion?: number;
  network: string;
  chainId?: number;
  generatedAt: string;
  analysisDataThrough?: string | null;
  maxTimestamp?: string | null;
  freshnessStatus?: string | null;
  freshnessLabel?: string | null;
  dashboardRefreshAgeSeconds?: number | null;
  onchainDataLagSeconds?: number | null;
  dashboardObjectKey?: string;
  manifestObjectKey?: string;
  publicGoldFresh?: boolean;
  rowCount?: number;
  split?: {
    schemaVersion: number;
    basePath: string;
    summary: string;
    addressMap: string;
    traderIndexShards: string[];
    traderActivityShards: string[];
    topProfileAddresses?: string[];
    shardSize: number;
    totalTraders: number;
  } | null;
  files?: PublicDashboardManifestFile[];
  privateDataIncluded?: boolean;
  walletHandleJoinIncluded?: boolean;
};

export type PublicTraderIndexShard = {
  schemaVersion: number;
  generatedAt: string;
  network: string;
  kind: "traders_index";
  shardIndex: number;
  shardCount: number;
  rowCount: number;
  rows: TraderRecord[];
};

export type PublicTraderActivityShard = {
  schemaVersion: number;
  generatedAt: string;
  network: string;
  kind: "trader_activity";
  shardIndex: number;
  shardCount: number;
  rowCount: number;
  rows: Array<{ address: string; activity: TraderActivityPoint[] }>;
};

export type PublicTraderAddressMap = {
  schemaVersion: number;
  generatedAt: string;
  network: string;
  kind: "trader_address_map";
  shardSize: number;
  totalTraders: number;
  addresses: Record<
    string,
    {
      indexShard: string;
      activityShard: string;
      rank?: number;
      shortAddress?: string;
    }
  >;
};
