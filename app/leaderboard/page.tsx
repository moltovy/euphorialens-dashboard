import { OfficialLeaderboardTable } from "@/components/official-leaderboard-table";
import { OnchainLeaderboardViews } from "@/components/onchain-leaderboard-views";
import { FreshnessBadge } from "@/components/freshness-badge";
import { KpiCard, SectionHeader } from "@/components/kpi-card";
import { PublicShell } from "@/components/public-shell";
import { getDashboardData } from "@/lib/dashboard-data-server";
import { getOfficialLeaderboard } from "@/lib/official-euphoria";
import { formatDateTime, formatInteger, formatOptionalUsd } from "@/lib/format";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function LeaderboardPage() {
  const [{ asOfUtc, dataSource, metadata, summary, traders }, officialLeaderboard] = await Promise.all([
    getDashboardData(),
    getOfficialLeaderboard({ timeWindow: "all", metric: "payouts" }),
  ]);
  const tradingAccounts = summary.tradingAccounts ?? summary.platformTraderAddressCount ?? traders.length;
  const officialTop = officialLeaderboard.rows[0];
  const officialStats = officialLeaderboard.tradingStats;

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
              title="Official Euphoria leaderboard"
              description="Default ranking uses Euphoria Finance's official all-time leaderboard metric. EuphoriaLens on-chain wallet analytics are shown separately below."
            />
            <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <KpiCard
                label="Official #1"
                value={officialTop ? officialTop.valueDisplay : "Unavailable"}
                detail={
                  officialTop
                    ? `${officialTop.displayName} (@${officialTop.username}) from the official all-time ranking.`
                    : "Official app data did not load; on-chain estimates are not substituted."
                }
                tone={officialTop ? "pink" : "red"}
              />
              <KpiCard
                label="Official Rows"
                value={formatInteger(officialLeaderboard.rows.length)}
                detail="Rows returned by the official Euphoria leaderboard source."
                tone="purple"
              />
              <KpiCard
                label="Official Volume"
                value={formatOptionalUsd(officialStats?.volumeUsd, { compact: true })}
                detail="Official trading stats when exposed by the public app source."
                tone="cyan"
              />
              <KpiCard
                label="On-chain Accounts"
                value={formatInteger(tradingAccounts)}
                detail="EuphoriaLens lifecycle-derived platform account addresses."
                tone="green"
              />
            </div>
            <div className="mb-4 flex flex-col gap-3 rounded-lg border border-white/10 bg-euphoria-panel/[0.72] p-4 shadow-panel backdrop-blur md:flex-row md:items-center md:justify-between">
              <FreshnessBadge dataSource={dataSource} metadata={metadata} renderedAt={new Date().toISOString()} />
              <div className="text-xs text-euphoria-muted md:text-right">
                <div className="font-bold uppercase tracking-[0.12em] text-white/70">Official leaderboard fetched</div>
                <div className="mt-1 text-white">{formatDateTime(officialLeaderboard.generatedAt)}</div>
              </div>
            </div>
            <div className="grid gap-4">
              <OfficialLeaderboardTable leaderboard={officialLeaderboard} />
              <OnchainLeaderboardViews rows={traders} />
            </div>
          </div>
        </section>
      </main>
    </PublicShell>
  );
}
