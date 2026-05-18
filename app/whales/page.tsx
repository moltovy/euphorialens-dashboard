import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { ChartPanel, ConcentrationCurveChart, TimeSeriesChart } from "@/components/charts";
import { KpiCard, SectionHeader } from "@/components/kpi-card";
import { PublicShell } from "@/components/public-shell";
import { getDashboardData } from "@/lib/dashboard-data-server";
import { formatDate, formatInteger, formatOptionalPercent, formatOptionalUsd, formatUsd } from "@/lib/format";
import { getMegaEthAddressUrl } from "@/lib/links";

export const revalidate = 300;

export default async function WhalesPage() {
  const { asOfUtc, largestTransfers, overviewSeries, traders, whaleMetrics, whaleTraders } = await getDashboardData();

  return (
    <PublicShell active="/whales" asOfUtc={asOfUtc}>
      <main className="px-4 py-8 md:py-10">
        <section className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Concentration"
            title="Trader Concentration"
            description="High-volume accounts, Net PNL (Est.), and large payout activity from public-safe lifecycle records."
          />

          <div className="grid gap-3 lg:grid-cols-3">
            {whaleMetrics.map((metric, i) => {
              const stickers = ["/brand/stickers/14.webp", "/brand/stickers/15.webp", "/brand/stickers/16.webp"];
              return (
                <KpiCard key={metric.label} label={metric.label} value={metric.value} detail={metric.detail} icon={<img src={stickers[i]} alt="" className="h-11 w-11 object-contain drop-shadow-[0_0_8px_rgba(252,141,244,0.3)]" />} tone={i === 0 ? "pink" : i === 1 ? "cyan" : "purple"} />
              );
            })}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-3">
            <ChartPanel title="Concentration Curve" eyebrow="Volume share">
              <ConcentrationCurveChart traders={traders} />
            </ChartPanel>
            <ChartPanel title="Daily Taps and Active Accounts" eyebrow="Activity">
              <TimeSeriesChart data={overviewSeries} mode="activity" />
            </ChartPanel>
            <ChartPanel title="New Trading Accounts" eyebrow="Growth">
              <TimeSeriesChart data={overviewSeries} mode="newTraders" />
            </ChartPanel>
          </div>

          <div className="mt-8 grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-5 shadow-panel">
              <div className="mb-4 flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">Leaderboard</div>
                  <h3 className="mt-1 text-lg font-bold text-white">High-volume accounts</h3>
                </div>
                <span className="text-xs text-euphoria-muted">Top {formatInteger(whaleTraders.length)}</span>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[700px] border-collapse text-sm">
                  <thead className="text-left text-xs uppercase tracking-[0.12em] text-euphoria-muted">
                    <tr>
                      <th className="border-b border-white/10 px-3 py-3">Account</th>
                      <th className="border-b border-white/10 px-3 py-3">Volume</th>
                      <th className="border-b border-white/10 px-3 py-3">Net PNL (Est.)</th>
                      <th className="border-b border-white/10 px-3 py-3">Win Rate</th>
                      <th className="border-b border-white/10 px-3 py-3">Largest Payout</th>
                    </tr>
                  </thead>
                  <tbody>
                    {whaleTraders.map((trader) => (
                      <tr key={trader.address} className="border-b border-white/[0.06]">
                        <td className="px-3 py-3">
                          <Link href={`/traders/${trader.address}`} className="inline-flex items-center gap-2 font-mono text-xs font-bold text-euphoria-pink transition hover:text-euphoria-magenta">
                            {trader.shortAddress}
                            <ArrowUpRight size={13} />
                          </Link>
                          <a
                            href={getMegaEthAddressUrl(trader.address)}
                            target="_blank"
                            rel="noreferrer"
                            className="ml-2 text-euphoria-muted transition hover:text-euphoria-pink"
                            title="Open address on MegaETH explorer"
                          >
                            <ArrowUpRight size={13} className="inline" />
                          </a>
                        </td>
                        <td className="px-3 py-3 font-bold text-white">{formatUsd(trader.volumeUsd, { compact: true })}</td>
                        <td className={Number(trader.accountPnlUsd ?? trader.pnlUsd) < 0 ? "px-3 py-3 font-bold text-euphoria-red" : "px-3 py-3 font-bold text-euphoria-green"}>
                          {formatOptionalUsd(trader.accountPnlUsd ?? trader.pnlUsd, { compact: true, signed: true })}
                        </td>
                        <td className="px-3 py-3 text-white">{formatOptionalPercent(trader.winRatePercent, 1)}</td>
                        <td className="px-3 py-3 font-bold text-white">{formatOptionalUsd(trader.largestPlatformPayoutUsd ?? trader.largestSettlementUsd, { compact: true })}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-5 shadow-panel">
              <div className="mb-4">
                <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">Payouts</div>
                <h3 className="mt-1 text-lg font-bold text-white">Largest platform payouts</h3>
              </div>
              <div className="space-y-3">
                {largestTransfers.map((trader) => (
                  <Link
                    key={trader.address}
                    href={`/traders/${trader.address}`}
                    className="flex items-center justify-between gap-4 rounded-md border border-white/10 bg-white/[0.035] p-3 transition hover:border-euphoria-pink/[0.45]"
                  >
                    <div>
                      <div className="font-mono text-xs font-bold text-euphoria-pink transition group-hover:text-euphoria-magenta">{trader.shortAddress}</div>
                      <div className="mt-1 text-xs text-euphoria-muted">Last active {formatDate(trader.lastActive)}</div>
                    </div>
                    <div className="text-right font-bold text-euphoria-green">
                      {formatUsd(trader.largestPlatformPayoutUsd ?? trader.largestSettlementUsd ?? trader.largestTransferUsd, { compact: true })}
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
