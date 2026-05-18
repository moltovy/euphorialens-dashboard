import { LeaderboardTable } from "@/components/leaderboard-table";
import { KpiCard, SectionHeader } from "@/components/kpi-card";
import { PublicShell } from "@/components/public-shell";
import { getDashboardData } from "@/lib/dashboard-data-server";
import { formatInteger, formatOptionalPercent, formatOptionalUsd } from "@/lib/format";

export const revalidate = 300;

export default async function LeaderboardPage() {
  const { asOfUtc, metadata, summary, traders } = await getDashboardData();
  const tradingAccounts = summary.tradingAccounts ?? summary.platformTraderAddressCount ?? traders.length;
  const largestPlatformPayout = summary.largestPlatformPayoutUsd ?? summary.largestSettlementUsd;

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
            title="Net PNL leaderboard"
            description="Search, sort, and open every indexed trading account profile. Rows default to Net PNL (Est.); Leaderboard Score is shown separately."
          />
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Trading Accounts"
              value={formatInteger(tradingAccounts)}
              detail="Platform account addresses from lifecycle events."
              tone="purple"
            />
            <KpiCard
              label="Top Net PNL (Est.)"
              value={formatOptionalUsd(summary.topAccountPnlUsd ?? traders[0]?.accountPnlUsd ?? traders[0]?.pnlUsd, {
                signed: true,
              })}
              detail={metadata.pnlMethodology ?? "Estimated account result: platform payouts minus observed stakes."}
              tone="green"
            />
            <KpiCard label="Platform Win Rate" value={formatOptionalPercent(summary.platformAccountWinRatePercent, 1)} detail="Recipient-aware account outcome rate." tone="cyan" />
            <KpiCard
              label="Largest Platform Payout"
              value={formatOptionalUsd(largestPlatformPayout, { compact: true })}
              detail="Largest Engine-to-account payout."
              tone="green"
            />
          </div>
          <LeaderboardTable rows={traders} title="Sortable Net PNL rankings" />
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
