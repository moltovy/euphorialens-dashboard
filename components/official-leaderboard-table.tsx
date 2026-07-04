"use client";

import { useMemo, useState } from "react";
import { Search } from "lucide-react";

import type { OfficialLeaderboardData, OfficialLeaderboardRow } from "@/lib/types";

type OfficialLeaderboardTableProps = {
  leaderboard: OfficialLeaderboardData;
};

function TraderAvatar({ row }: { row: OfficialLeaderboardRow }) {
  if (row.avatarUrl) {
    return (
      <img
        src={row.avatarUrl}
        alt=""
        className="h-10 w-10 rounded-full border border-white/15 object-cover"
        loading="lazy"
      />
    );
  }
  return (
    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-euphoria-pink/20 text-sm font-black text-white">
      {(row.displayName || row.username || "?").slice(0, 1).toUpperCase()}
    </div>
  );
}

export function OfficialLeaderboardTable({ leaderboard }: OfficialLeaderboardTableProps) {
  const [query, setQuery] = useState("");
  const normalizedQuery = query.trim().toLowerCase();
  const rows = useMemo(
    () =>
      leaderboard.rows.filter(
        (row) =>
          !normalizedQuery ||
          row.displayName.toLowerCase().includes(normalizedQuery) ||
          row.username.toLowerCase().includes(normalizedQuery),
      ),
    [leaderboard.rows, normalizedQuery],
  );

  if (leaderboard.status !== "ok") {
    return (
      <section className="rounded-lg border border-euphoria-red/35 bg-euphoria-red/10 p-5 shadow-panel">
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-red">
          Official source unavailable
        </div>
        <h2 className="mt-2 text-xl font-black text-white">Official all-time leaderboard could not be loaded</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-euphoria-subtle">
          EuphoriaLens will not substitute estimated wallet PNL for the official leaderboard. The public app data
          route returned: {leaderboard.error ?? leaderboard.staleReason ?? "unknown error"}.
        </p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4 shadow-panel backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">
            Official Euphoria source
          </div>
          <h2 className="mt-1 text-xl font-bold text-white">Official All-Time Leaderboard</h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-euphoria-muted">
            Ranked by Euphoria Finance&apos;s public app metric, not by EuphoriaLens wallet-level estimates.
          </p>
        </div>
        <label className="relative block lg:min-w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-euphoria-muted" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search official name or username"
            className="w-full rounded-md border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-euphoria-muted focus:border-euphoria-pink/70"
          />
        </label>
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-lg border border-white/10 md:block">
        <div className="max-h-[930px] overflow-auto">
          <table className="w-full min-w-[860px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-euphoria-panel/[0.98] text-left text-xs uppercase tracking-[0.12em] text-euphoria-muted backdrop-blur">
              <tr>
                <th className="border-b border-white/10 px-4 py-3">Rank</th>
                <th className="border-b border-white/10 px-4 py-3">Trader</th>
                <th className="border-b border-white/10 px-4 py-3 text-right">Official All-Time Ranking</th>
                <th className="border-b border-white/10 px-4 py-3">Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.rank}-${row.username}`} className="border-b border-white/[0.06]">
                  <td className="px-4 py-3">
                    <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-2 font-mono text-xs text-white">
                      {row.rank}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <TraderAvatar row={row} />
                      <div className="min-w-0">
                        <div className="truncate font-bold text-white">{row.displayName}</div>
                        <div className="truncate text-sm text-euphoria-muted">@{row.username}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-base font-black text-euphoria-cyan">
                    {row.valueDisplay}
                  </td>
                  <td className="px-4 py-3 text-xs font-bold uppercase tracking-[0.12em] text-euphoria-muted">
                    Official app
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {rows.map((row) => (
          <article key={`${row.rank}-${row.username}`} className="rounded-lg border border-white/10 bg-white/[0.035] p-4">
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                <TraderAvatar row={row} />
                <div className="min-w-0">
                  <div className="text-xs font-bold uppercase tracking-[0.14em] text-euphoria-muted">
                    Rank {row.rank}
                  </div>
                  <div className="mt-1 truncate font-bold text-white">{row.displayName}</div>
                  <div className="truncate text-sm text-euphoria-muted">@{row.username}</div>
                </div>
              </div>
              <div className="shrink-0 font-mono text-lg font-black text-euphoria-cyan">{row.valueDisplay}</div>
            </div>
          </article>
        ))}
      </div>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-euphoria-muted">
          No official leaderboard records match the current search.
        </div>
      ) : null}
    </section>
  );
}
