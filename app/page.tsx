import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import {
  ChartPanel,
  ConcentrationCurveChart,
  PnlDistributionChart,
  TapsOutcomeChart,
  TapsPerAccountChart,
  TimeSeriesChart,
} from "@/components/charts";
import { FreshnessBadge } from "@/components/freshness-badge";
import { KpiCard, SectionHeader } from "@/components/kpi-card";
import { PublicShell } from "@/components/public-shell";
import { SeamlessVideo } from "@/components/seamless-video";
import { getDashboardSummary } from "@/lib/dashboard-data-server";
import type { DashboardSummaryData } from "@/lib/dashboard-data";
import { formatDateTime, formatInteger, formatOptionalPercent, formatOptionalUsd, formatUsd } from "@/lib/format";

export const revalidate = 300;

function LeaderboardPreview({ traders }: { traders: DashboardSummaryData["leaderboardPreviewRows"] }) {
  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-euphoria-panel/[0.86]">
      <table className="w-full min-w-[980px] border-collapse text-sm">
        <thead className="bg-[#120d1d]/95 text-left text-xs uppercase tracking-[0.12em] text-euphoria-muted">
          <tr>
            <th className="px-4 py-3">Rank</th>
            <th className="px-4 py-3">Trader</th>
            <th className="px-4 py-3">Leaderboard Score</th>
            <th className="px-4 py-3">Net PNL (Est.)</th>
            <th className="px-4 py-3">Volume</th>
            <th className="px-4 py-3">Taps</th>
            <th className="px-4 py-3">Win Rate</th>
            <th className="px-4 py-3 text-right">Largest Payout</th>
          </tr>
        </thead>
        <tbody>
          {traders.slice(0, 10).map((trader) => (
            <tr key={trader.address} className="border-t border-white/[0.06]">
              <td className="px-4 py-3 font-mono text-white">{trader.rank}</td>
              <td className="px-4 py-3">
                <Link href={`/traders/${trader.address}`} className="font-mono text-xs font-bold text-euphoria-pink hover:text-euphoria-magenta transition">
                  {trader.shortAddress}
                </Link>
              </td>
              <td className="px-4 py-3 text-euphoria-cyan font-mono font-bold">
                {formatOptionalUsd(trader.leaderboardPayoutUsd ?? trader.estimatedLeaderboardPnlUsd, { compact: true })}
              </td>
              <td className={`px-4 py-3 font-mono font-bold ${Number(trader.accountPnlUsd ?? trader.pnlUsd) < 0 ? "text-euphoria-red" : "text-euphoria-green"}`}>
                {formatOptionalUsd(trader.accountPnlUsd ?? trader.pnlUsd, { signed: true, compact: true })}
              </td>
              <td className="px-4 py-3 text-white font-mono">{formatUsd(trader.volumeUsd, { compact: true })}</td>
              <td className="px-4 py-3 text-white font-mono">{formatInteger(trader.activityEvents ?? trader.transferBets)}</td>
              <td className="px-4 py-3 text-white font-mono">{formatOptionalPercent(trader.winRatePercent, 1)}</td>
              <td className="px-4 py-3 text-right text-euphoria-cyan font-mono font-bold">
                {formatOptionalUsd(trader.largestPlatformPayoutUsd ?? trader.largestSettlementUsd, { compact: true })}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default async function HomePage() {
  const {
    dataSource,
    metadata,
    overviewSeries,
    asOfUtc,
    pnlDistribution: payloadPnlDistribution,
    summary,
    tapCountDistribution,
    tapOutcomeDistribution,
    tradeUrl,
    leaderboardPreviewRows,
    concentrationCurve,
    whaleMetrics,
    xUrl,
  } = await getDashboardSummary();
  const pnlDistribution = metadata.pnlAvailable ? payloadPnlDistribution : null;
  const whalePreviewRows = [...leaderboardPreviewRows].sort((a, b) => b.volumeUsd - a.volumeUsd).slice(0, 2);
  const tradingAccounts = summary.tradingAccounts ?? summary.platformTraderAddressCount ?? summary.indexedTraders ?? summary.totalTraders;
  const totalTaps = summary.indexedActivity ?? summary.activityEvents ?? summary.transferBets;
  const largestPlatformPayout = summary.largestPlatformPayoutUsd ?? summary.largestSettlementUsd;
  const renderedAt = new Date().toISOString();

  return (
    <PublicShell active="/" asOfUtc={asOfUtc} metadata={metadata}>
      <main className="px-4 py-8 md:py-10">
        <section className="mx-auto max-w-7xl flex flex-col-reverse md:flex-row md:items-center justify-between gap-8">
          <div className="relative z-10 max-w-4xl">
            <div className="text-xs font-bold uppercase tracking-[0.2em] text-euphoria-pink">On-Chain Analysis</div>
            <h1 className="mt-3 text-4xl font-black text-white md:text-6xl tracking-tight">
              EuphoriaLens <br className="hidden md:block" /><span className="text-gradient-euphoria">Analytics</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-euphoria-muted md:text-lg">
              On-chain analytics for Euphoria Finance mainnet activity.
            </p>
            <p className="mt-3 max-w-2xl rounded-lg border border-white/10 bg-white/[0.035] px-4 py-3 text-sm leading-6 text-euphoria-subtle">
              EuphoriaLens is an independent research dashboard. Not affiliated with, endorsed by, or sponsored by Euphoria Finance.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={tradeUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 rounded-md bg-gradient-to-r from-euphoria-magenta to-euphoria-purple px-6 py-3 text-sm font-bold text-white transition hover:opacity-80 shadow-lg shadow-euphoria-magenta/20"
              >
                Trade on Euphoria
                <ArrowUpRight size={16} />
              </a>
              <a
                href={xUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="Follow Euphoria on X"
                className="inline-flex h-11 w-11 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white transition hover:border-euphoria-pink/50 hover:bg-white/[0.08]"
              >
                <img src="/brand/x-logo.webp" alt="X" className="h-3.5 w-3.5" />
              </a>
            </div>
          </div>
          <div className="relative hidden md:block shrink-0">
            <div className="absolute inset-0 -z-10 rounded-full bg-euphoria-pink/10 blur-[80px]" />
            <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-1 shadow-2xl">
              <SeamlessVideo
                className="h-[280px] w-[280px] object-cover rounded-xl opacity-90 mix-blend-screen"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent pointer-events-none" />
            </div>
          </div>
        </section>

        <section className="mx-auto mt-8 max-w-7xl">
          <div className="flex flex-col gap-3 rounded-lg border border-white/10 bg-euphoria-panel/[0.72] p-4 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
            <FreshnessBadge
              dataSource={dataSource}
              metadata={metadata}
              renderedAt={renderedAt}
            />
            <div className="grid gap-3 text-xs text-euphoria-muted md:text-right">
              <div>
                <div className="font-bold uppercase tracking-[0.12em] text-white/70">Dashboard feed</div>
                <div className="mt-1 text-white">{formatDateTime(asOfUtc)}</div>
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-4 grid max-w-7xl gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard
            label="On-chain Volume"
            value={formatUsd(summary.totalVolumeUsd, { compact: true })}
            detail="Total public activity volume."
            icon={<img src="/brand/stickers/1.webp" alt="Euphoria goat sticker" className="h-11 w-11 object-contain drop-shadow-[0_0_8px_rgba(252,141,244,0.28)]" />}
            tone="pink"
          />
          <KpiCard label="Total Taps" value={formatInteger(totalTaps)} detail="Matched lifecycle tap records." tone="cyan" />
          <KpiCard
            label="Trading Accounts"
            value={formatInteger(tradingAccounts)}
            detail="Platform account addresses from lifecycle events."
            tone="purple"
          />
          <KpiCard
            label="Net PNL (Est.)"
            value={formatOptionalUsd(summary.totalAccountPnlUsd ?? summary.accountPnlUsd, {
              signed: true,
            })}
            detail="Estimated account result: platform payouts minus observed stakes."
            icon={<img src="/brand/stickers/7.webp" alt="Euphoria goat sticker" className="h-11 w-11 object-contain drop-shadow-[0_0_8px_rgba(94,234,212,0.24)]" />}
            tone="green"
          />
          <KpiCard label="Platform Win Rate" value={formatOptionalPercent(summary.platformAccountWinRatePercent, 1)} detail="Recipient-aware account outcome rate." tone="purple" />
          <KpiCard label="Largest Payout" value={formatOptionalUsd(largestPlatformPayout, { compact: true })} detail="Largest Engine-to-account payout." tone="green" />
        </section>

        <section className="mx-auto mt-12 max-w-7xl">
          <SectionHeader
            eyebrow="Market Dynamics"
            title="Overview & PnL Distribution"
            description="Net PNL (Est.) distribution across indexed public trading accounts."
          />
          <ChartPanel title={metadata.pnlAvailable ? "PnL Distribution" : "PnL Validation Pending"} eyebrow="Estimated account metric">
            {pnlDistribution ? (
              <PnlDistributionChart buckets={pnlDistribution.buckets} stats={pnlDistribution.stats} />
            ) : (
              <div className="flex min-h-[360px] flex-col justify-center rounded-lg border border-white/10 bg-white/[0.03] p-6">
                <div className="text-sm font-bold uppercase tracking-[0.16em] text-euphoria-pink">
                  Real wallet PnL is not published yet
                </div>
                <p className="mt-3 max-w-xl text-sm leading-6 text-euphoria-muted">
                  The dashboard is using verified activity, volume, settlement, and signer metrics while lifecycle
                  identity and loss semantics are being audited. Net PNL (Est.) appears here only when
                  both observed stake and platform payout fields are available.
                </p>
              </div>
            )}
          </ChartPanel>
        </section>

        <section className="mx-auto mt-10 max-w-7xl">
          <SectionHeader
            eyebrow="Account analytics"
            title="Volume, PNL, and concentration"
            description="Public account-level views derived from the same dashboard JSON rows."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartPanel title="Taps Outcome" eyebrow="Wins / losses">
              <TapsOutcomeChart traders={[]} buckets={tapOutcomeDistribution} />
            </ChartPanel>
            <ChartPanel title="Accounts by Tap Count" eyebrow="Account cohorts">
              <TapsPerAccountChart traders={[]} buckets={tapCountDistribution} />
            </ChartPanel>
            <ChartPanel title="Concentration Curve" eyebrow="Volume share">
              <ConcentrationCurveChart points={concentrationCurve} />
            </ChartPanel>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-7xl">
          <SectionHeader
            eyebrow="Time series"
            title="Public activity"
            description="On-chain volume, tap activity, and account growth patterns using public-safe lifecycle records."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            <ChartPanel title="Cumulative Volume" eyebrow="On-chain volume">
              <TimeSeriesChart data={overviewSeries} mode="volume" />
            </ChartPanel>
            <ChartPanel title="Daily Taps and Active Accounts" eyebrow="Activity">
              <TimeSeriesChart data={overviewSeries} mode="activity" />
            </ChartPanel>
            <ChartPanel title="New Trading Accounts" eyebrow="Growth">
              <TimeSeriesChart data={overviewSeries} mode="newTraders" />
            </ChartPanel>
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-7xl">
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <SectionHeader
            eyebrow="Leaderboard"
            title="Net PNL leaderboard"
            description="Ranked by Net PNL (Est.) across all indexed trading accounts. Leaderboard Score is shown separately."
            />
            <Link
              href="/leaderboard"
              className="inline-flex items-center gap-2 self-start rounded-md border border-euphoria-pink/50 bg-euphoria-pink/10 px-4 py-2 text-sm font-bold text-white transition hover:bg-euphoria-pink/20"
            >
              Open full leaderboard
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <div className="overflow-x-auto">
            <LeaderboardPreview traders={leaderboardPreviewRows} />
          </div>
        </section>

        <section className="mx-auto mt-10 max-w-7xl">
          <SectionHeader
            eyebrow="Concentration"
            title="Trader Concentration"
            description="High-volume trader concentration using public on-chain account activity."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {whaleMetrics.map((metric) => (
              <KpiCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} tone="cyan" />
            ))}
          </div>
          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            {whalePreviewRows.map((trader) => (
              <Link
                key={trader.address}
                href={`/traders/${trader.address}`}
                className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-5 transition hover:border-euphoria-pink/[0.45]"
              >
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">Large trader insight</div>
                <div className="mt-2 font-mono text-xl font-black text-white">{trader.shortAddress}</div>
                <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div>
                    <div className="text-euphoria-muted">Volume</div>
                    <div className="mt-1 font-bold text-white">{formatUsd(trader.volumeUsd, { compact: true })}</div>
                  </div>
                  <div>
                    <div className="text-euphoria-muted">Volume Rank</div>
                    <div className="mt-1 font-bold text-white">#{trader.volumeRank ?? trader.rank}</div>
                  </div>
                  <div>
                    <div className="text-euphoria-muted">Largest payout</div>
                    <div className="mt-1 font-bold text-white">{formatOptionalUsd(trader.largestSettlementUsd, { compact: true })}</div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
