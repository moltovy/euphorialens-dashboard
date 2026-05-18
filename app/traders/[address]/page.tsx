import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

import { ChartPanel, TraderProfileChart } from "@/components/charts";
import { CopyAddressButton } from "@/components/copy-address-button";
import { CohortBadge, KpiCard, SectionHeader } from "@/components/kpi-card";
import { PublicShell } from "@/components/public-shell";
import { getTopProfileAddresses, getTraderProfile } from "@/lib/dashboard-data-server";
import { formatDate, formatInteger, formatOptionalPercent, formatOptionalUsd, formatUsd } from "@/lib/format";
import { getMegaEthAddressUrl } from "@/lib/links";

type PageProps = {
  params: Promise<{ address: string }>;
};

const cohortLabels: Record<string, string> = {
  whale: "Top Wallet",
  "high-volume": "High Volume",
  "recent-active": "Recent Active",
  grinder: "Power User",
};

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const addresses = await getTopProfileAddresses(50);
  return addresses.map((address) => ({ address }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { address } = await params;
  const profile = await getTraderProfile(address);

  return {
    title: profile ? `${profile.trader.shortAddress} | Euphoria Trader Profile` : "Trader not found",
  };
}

export default async function TraderProfilePage({ params }: PageProps) {
  const { address } = await params;
  const profile = await getTraderProfile(address);

  if (!profile) notFound();
  const { asOfUtc, metadata, trader } = profile;

  return (
    <PublicShell active="/traders" asOfUtc={asOfUtc} metadata={metadata}>
      <main className="px-4 py-8 md:py-10">
        <section className="mx-auto max-w-7xl">
          <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-euphoria-pink">Trader profile</div>
              <h1 className="mt-2 font-mono text-3xl font-black text-white md:text-5xl">{trader.shortAddress}</h1>
              <p className="mt-3 max-w-3xl break-all text-sm leading-6 text-euphoria-muted">{trader.address}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {trader.cohorts.map((cohort) => (
                  <CohortBadge key={cohort}>{cohortLabels[cohort]}</CohortBadge>
                ))}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 lg:flex-col lg:items-end lg:justify-start">
              <div className="hidden lg:block -mt-8 mb-2">
                <img src="/brand/9.webp" alt="Pill" className="w-16 h-16 object-contain mix-blend-screen opacity-80 filter drop-shadow-[0_0_15px_rgba(252,141,244,0.2)]" />
              </div>
              <div className="flex gap-2">
                <CopyAddressButton address={trader.address} />
                <a
                  href={getMegaEthAddressUrl(trader.address)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:border-euphoria-pink/40"
                >
                  Explorer
                  <ArrowUpRight size={16} />
                </a>
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            <KpiCard
              label="Net PNL (Est.)"
              value={formatOptionalUsd(trader.accountPnlUsd ?? trader.pnlUsd, {
                compact: true,
                signed: true,
              })}
              detail={metadata.pnlMethodology ?? "Estimated account result: platform payouts minus observed stakes."}
              icon={<img src="/brand/stickers/21.webp" alt="Euphoria mascot" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(252,141,244,0.3)]" />}
              tone={Number(trader.accountPnlUsd ?? trader.pnlUsd ?? 0) >= 0 ? "green" : "red"}
            />
            <KpiCard label="Volume" value={formatUsd(trader.volumeUsd, { compact: true })} detail="Public on-chain volume." icon={<img src="/brand/stickers/1.webp" alt="Euphoria mascot" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(252,141,244,0.3)]" />} tone="pink" />
            <KpiCard label="Total Taps" value={formatInteger(trader.activityEvents ?? trader.transferBets)} detail="Observed tap lifecycle activity." icon={<img src="/brand/stickers/11.webp" alt="Euphoria mascot" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(252,141,244,0.3)]" />} tone="cyan" />
            <KpiCard label="Platform Win Rate" value={formatOptionalPercent(trader.winRatePercent, 1)} detail="Recipient-aware account outcome rate." icon={<img src="/brand/stickers/4.webp" alt="Euphoria mascot" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(252,141,244,0.3)]" />} tone="purple" />
            <KpiCard
              label="Largest Platform Payout"
              value={formatOptionalUsd(trader.largestPlatformPayoutUsd ?? trader.largestSettlementUsd, { compact: true })}
              detail="Largest Engine-to-account payout."
              icon={<img src="/brand/stickers/19.webp" alt="Euphoria mascot" className="h-10 w-10 object-contain drop-shadow-[0_0_8px_rgba(252,141,244,0.3)]" />}
              tone="cyan"
            />
            <KpiCard label="Largest Bet" value={formatOptionalUsd(trader.largestBetUsd, { compact: true })} detail="Largest observed stake." tone="green" />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-euphoria-muted">First seen</div>
              <div className="mt-2 text-lg font-bold text-white">{formatDate(trader.firstSeen)}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4">
              <div className="text-xs font-bold uppercase tracking-[0.14em] text-euphoria-muted">Last seen</div>
              <div className="mt-2 text-lg font-bold text-white">{formatDate(trader.lastActive)}</div>
            </div>
          </div>

          <section className="mt-10">
            <SectionHeader
              eyebrow="Taps"
              title="Trader time series"
              description="Profile charts use public-safe on-chain account activity only."
            />
            <div className="grid gap-4 lg:grid-cols-3">
              <ChartPanel title="Taps over time" eyebrow="Taps">
                <TraderProfileChart data={trader.activity} mode="activity" />
              </ChartPanel>
              <ChartPanel title="Cumulative volume" eyebrow="Volume">
                <TraderProfileChart data={trader.activity} mode="cumulative" />
              </ChartPanel>
              <ChartPanel title="Volume over time" eyebrow="Volume">
                <TraderProfileChart data={trader.activity} mode="volume" />
              </ChartPanel>
            </div>
          </section>

          <section className="mt-10 rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-5 shadow-panel">
            <div className="mb-4">
              <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">Recent samples</div>
              <h2 className="mt-1 text-xl font-bold text-white">Recent taps</h2>
              <p className="mt-2 text-sm leading-6 text-euphoria-muted">
                Rows are daily public tap aggregates.
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px] border-collapse text-sm">
                <thead className="text-left text-xs uppercase tracking-[0.12em] text-euphoria-muted">
                  <tr>
                    <th className="border-b border-white/10 px-3 py-3">Date</th>
                    <th className="border-b border-white/10 px-3 py-3">Volume</th>
                    <th className="border-b border-white/10 px-3 py-3">Taps</th>
                    <th className="border-b border-white/10 px-3 py-3">Settlements</th>
                    <th className="border-b border-white/10 px-3 py-3">Cumulative volume</th>
                  </tr>
                </thead>
                <tbody>
                  {trader.activity.slice(-12).reverse().map((activity) => (
                    <tr key={activity.date} className="border-b border-white/[0.06]">
                      <td className="px-3 py-3 text-euphoria-muted">{formatDate(activity.date)}</td>
                      <td className="px-3 py-3 font-bold text-white">{formatUsd(activity.volumeUsd)}</td>
                      <td className="px-3 py-3 text-white">{formatInteger(activity.activityEvents ?? activity.transferBets)}</td>
                      <td className="px-3 py-3 text-white">{formatInteger(activity.settlements ?? activity.settlementTransfers)}</td>
                      <td className="px-3 py-3 font-bold text-white">{formatUsd(activity.cumulativeVolumeUsd)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </section>
      </main>
    </PublicShell>
  );
}
