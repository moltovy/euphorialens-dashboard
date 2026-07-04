"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ExternalLink, Search } from "lucide-react";

import { filterTraders } from "@/lib/dashboard-data";
import { formatDate, formatOptionalPercent, formatOptionalUsd, formatUsd } from "@/lib/format";
import { getMegaEthAddressUrl } from "@/lib/links";
import { traderDisplayName, traderSecondaryLabel } from "@/lib/trader-display";
import type { CohortFilter, TraderRecord } from "@/lib/types";

export function TraderSearch({ rows }: { rows: TraderRecord[] }) {
  const [query, setQuery] = useState("");
  const cohort: CohortFilter = "all";

  const filteredRows = useMemo(() => filterTraders(rows, query, cohort), [rows, query, cohort]);

  return (
    <section className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4 shadow-panel backdrop-blur md:p-5">
      <div className="grid gap-3 lg:grid-cols-[1fr_1.4fr] lg:items-end">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">Discovery</div>
          <h2 className="mt-1 text-xl font-bold text-white">Find a trader profile</h2>
          <p className="mt-2 text-sm leading-6 text-euphoria-muted">
            Search public trading account records and open profile pages with activity, volume, and explorer links.
          </p>
        </div>
        <div>
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-euphoria-muted" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by trader or 0x address"
              className="w-full rounded-md border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-euphoria-muted focus:border-euphoria-pink/70"
            />
          </label>
        </div>
      </div>

      <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filteredRows.slice(0, 36).map((trader) => (
          <article
            key={trader.address}
            className="rounded-lg border border-white/10 bg-white/[0.035] p-4 transition hover:border-euphoria-pink/50 hover:bg-white/[0.055]"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-euphoria-muted">
                  Rank {trader.rank}
                </div>
                <div className="mt-1 flex items-center gap-2 text-sm font-bold text-euphoria-pink">
                  <Link href={`/traders/${trader.address}`} className="transition hover:text-euphoria-magenta">
                    <span className="block">{traderDisplayName(trader)}</span>
                    <span className="block font-mono text-[11px] text-euphoria-muted">{traderSecondaryLabel(trader)}</span>
                  </Link>
                  <a
                    href={getMegaEthAddressUrl(trader.address)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-euphoria-muted transition hover:text-euphoria-pink"
                    title="Open address on MegaETH explorer"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <ExternalLink size={13} />
                  </a>
                </div>
              </div>
              <div className="text-right font-bold text-euphoria-cyan">
                {formatOptionalUsd(trader.leaderboardPayoutUsd ?? trader.estimatedLeaderboardPnlUsd, {
                  compact: true,
                })}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Leaderboard Score</div>
                <div className="mt-1 font-bold text-euphoria-cyan">
                  {formatOptionalUsd(trader.leaderboardPayoutUsd ?? trader.estimatedLeaderboardPnlUsd, {
                    compact: true,
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Net PNL (Est.)</div>
                <div className={Number(trader.accountPnlUsd ?? trader.pnlUsd) < 0 ? "mt-1 font-bold text-euphoria-red" : "mt-1 font-bold text-euphoria-green"}>
                  {formatOptionalUsd(trader.accountPnlUsd ?? trader.pnlUsd, {
                    compact: true,
                    signed: true,
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Volume</div>
                <div className="mt-1 font-bold text-white">{formatUsd(trader.volumeUsd, { compact: true })}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">
                  Platform Win Rate
                </div>
                <div className="mt-1 font-bold text-white">{formatOptionalPercent(trader.winRatePercent, 1)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Largest Bet</div>
                <div className="mt-1 font-bold text-white">{formatOptionalUsd(trader.largestBetUsd, { compact: true })}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Largest Payout</div>
                <div className="mt-1 font-bold text-white">{formatOptionalUsd(trader.largestPlatformPayoutUsd ?? trader.largestSettlementUsd, { compact: true })}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Last active</div>
                <div className="mt-1 font-bold text-white">{formatDate(trader.lastActive)}</div>
              </div>
            </div>
          </article>
        ))}
      </div>

      {filteredRows.length > 36 ? (
        <p className="mt-4 text-sm text-euphoria-muted">
          Showing 36 of {filteredRows.length} matches. Refine the address search to narrow the list.
        </p>
      ) : null}
      {filteredRows.length === 0 ? (
        <div className="mt-5 rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-euphoria-muted">
          No trader profiles match the current filter.
        </div>
      ) : null}
    </section>
  );
}
