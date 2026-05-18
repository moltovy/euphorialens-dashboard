import { KpiCard, SectionHeader } from "@/components/kpi-card";
import { PublicShell } from "@/components/public-shell";
import { TraderOutcomeDistribution } from "@/components/trader-outcome-distribution";
import { TraderSearch } from "@/components/trader-search";
import { getDashboardData } from "@/lib/dashboard-data-server";
import { formatInteger, formatOptionalPercent, formatOptionalUsd } from "@/lib/format";

export const revalidate = 300;

export default async function TradersPage() {
  const { asOfUtc, metadata, summary, traders } = await getDashboardData();
  const whaleCount = traders.filter((trader) => trader.cohorts.includes("whale")).length;
  const tradingAccounts = summary.tradingAccounts ?? summary.platformTraderAddressCount ?? summary.totalTraders;

  return (
    <PublicShell active="/traders" asOfUtc={asOfUtc}>
      <main className="px-4 py-8 md:py-10">
        <section className="mx-auto max-w-7xl">
          <SectionHeader
            eyebrow="Traders"
            title="Search and discover trading accounts"
            description="Explore platform account profiles by address and on-chain activity without exposing private identity joins."
          />
          <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="Trading Accounts"
              value={formatInteger(tradingAccounts)}
              detail="Platform account addresses from lifecycle events."
              tone="purple"
            />
            <KpiCard label="Top wallets" value={formatInteger(whaleCount)} detail="High-volume wallets." tone="cyan" />
            <KpiCard
              label="Top Net PNL (Est.)"
              value={formatOptionalUsd(summary.topAccountPnlUsd ?? traders[0]?.accountPnlUsd ?? traders[0]?.pnlUsd, {
                signed: true,
              })}
              detail={metadata.pnlMethodology ?? "Estimated account result: platform payouts minus observed stakes."}
              tone="green"
            />
            <KpiCard label="Platform Win Rate" value={formatOptionalPercent(summary.platformAccountWinRatePercent, 1)} detail="Recipient-aware account outcome rate." tone="pink" />
          </div>
          <TraderOutcomeDistribution traders={traders} />
          <TraderSearch rows={traders} />
        </section>
      </main>
    </PublicShell>
  );
}
