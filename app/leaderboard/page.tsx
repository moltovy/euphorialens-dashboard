import { LeaderboardTable } from "@/components/leaderboard-table";
import { KpiCard, SectionHeader } from "@/components/kpi-card";
import { PublicShell } from "@/components/public-shell";
import { getDashboardData } from "@/lib/dashboard-data-server";
import { formatInteger, formatOptionalUsd, formatUsd } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LeaderboardPage() {
  const { asOfUtc, metadata, summary, traders } = await getDashboardData();
  const tradingAccounts = summary.tradingAccounts ?? summary.platformTraderAddressCount ?? traders.length;
  const largestPlatformPayout = summary.largestPlatformPayoutUsd ?? summary.largestSettlementUsd;
  const totalTaps = summary.indexedActivity ?? summary.activityEvents ?? summary.transferBets;
  const topVolume = traders[0]?.volumeUsd ?? null;

  return (
    <PublicShell active="/leaderboard" asOfUtc={asOfUtc} metadata={metadata}>
      <main className="px-4 py-8 md:py-10">
        <section className="relative mx-auto max-w-7xl overflow-hidden">
          <img
            src="/brand/leaderboard-beam-rework.webp"
            alt="Euphoria mascot beam"
            className="pointer-events-none absolute right-0 top-0 hidden h-full max-h-[280px] w-auto object-contain opacity-25 mix-blend-screen md:block"
          />
          <div className="relative z-10">
          <SectionHeader
            eyebrow="Leaderboard"
            title="All-time volume leaderboard"
            description="Search, sort, and open every indexed trading account profile. Rows default to on-chain all-time volume; estimated PNL is shown only as a secondary metric."
          />
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="On-chain Volume"
              value={formatUsd(summary.totalVolumeUsd, { compact: true })}
              detail="Total lifecycle-derived activity volume."
              tone="pink"
            />
            <KpiCard
              label="Trading Accounts"
              value={formatInteger(tradingAccounts)}
              detail="Platform account addresses from lifecycle events."
              tone="purple"
            />
            <KpiCard
              label="Top Account Volume"
              value={formatOptionalUsd(topVolume, { compact: true })}
              detail="Largest observed account volume in the current public feed."
              tone="green"
            />
            <KpiCard label="Total Taps" value={formatInteger(totalTaps)} detail="Matched lifecycle tap records." tone="cyan" />
            <KpiCard
              label="Largest Platform Payout"
              value={formatOptionalUsd(largestPlatformPayout, { compact: true })}
              detail="Largest Engine-to-account payout."
              tone="green"
            />
          </div>
          <LeaderboardTable rows={traders} title="Sortable all-time volume rankings" />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
