"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";

import { cn, formatInteger, formatOptionalUsd, formatUsd } from "@/lib/format";
import type { TraderRecord } from "@/lib/types";

type OnchainMode = "volume" | "estimated_net_pnl" | "platform_payout_candidate";

type OnchainLeaderboardViewsProps = {
  rows: TraderRecord[];
};

const modes: Array<{
  id: OnchainMode;
  label: string;
  description: string;
}> = [
  {
    id: "volume",
    label: "On-chain volume",
    description: "Lifecycle-derived observed stake volume by platform account address.",
  },
  {
    id: "estimated_net_pnl",
    label: "Estimated Net PNL",
    description: "Observed platform payouts minus observed stakes. This is an estimate, not the official leaderboard.",
  },
  {
    id: "platform_payout_candidate",
    label: "Payout candidate",
    description: "Engine-to-platform-account payout candidate from public lifecycle decoding.",
  },
];

function metricValue(row: TraderRecord, mode: OnchainMode) {
  if (mode === "volume") return row.volumeUsd;
  if (mode === "estimated_net_pnl") return row.accountPnlUsd ?? row.pnlUsd ?? null;
  return row.leaderboardPayoutUsd ?? row.estimatedLeaderboardPnlUsd ?? null;
}

function metricLabel(row: TraderRecord, mode: OnchainMode) {
  const value = metricValue(row, mode);
  if (mode === "volume") return typeof value === "number" ? formatUsd(value, { compact: true }) : "—";
  return formatOptionalUsd(value, { compact: true, signed: mode === "estimated_net_pnl" });
}

export function OnchainLeaderboardViews({ rows }: OnchainLeaderboardViewsProps) {
  const [mode, setMode] = useState<OnchainMode>("volume");
  const [query, setQuery] = useState("");
  const activeMode = modes.find((item) => item.id === mode) ?? modes[0];

  const visibleRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows
      .filter(
        (row) =>
          !normalizedQuery ||
          row.address.toLowerCase().includes(normalizedQuery) ||
          row.shortAddress.toLowerCase().includes(normalizedQuery),
      )
      .sort((a, b) => {
        const valueA = metricValue(a, mode);
        const valueB = metricValue(b, mode);
        const safeA = typeof valueA === "number" && Number.isFinite(valueA) ? valueA : Number.NEGATIVE_INFINITY;
        const safeB = typeof valueB === "number" && Number.isFinite(valueB) ? valueB : Number.NEGATIVE_INFINITY;
        return safeB - safeA;
      })
      .slice(0, 100);
  }, [mode, query, rows]);

  return (
    <section className="rounded-lg border border-white/10 bg-euphoria-panel/[0.78] p-4 shadow-panel backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">
            EuphoriaLens on-chain analytics
          </div>
          <h2 className="mt-1 text-xl font-bold text-white">Wallet/account-derived views</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-euphoria-muted">{activeMode.description}</p>
        </div>
        <label className="relative block lg:min-w-[360px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-euphoria-muted" size={16} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search wallet address"
            className="w-full rounded-md border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-euphoria-muted focus:border-euphoria-pink/70"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {modes.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setMode(item.id)}
            className={cn(
              "rounded-md border px-3 py-2 text-sm font-bold transition",
              item.id === mode
                ? "border-euphoria-pink/60 bg-euphoria-pink/15 text-white"
                : "border-white/10 bg-white/[0.03] text-euphoria-muted hover:border-euphoria-pink/35 hover:text-white",
            )}
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-hidden rounded-lg border border-white/10">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[920px] border-collapse text-sm">
            <thead className="bg-euphoria-panel/[0.98] text-left text-xs uppercase tracking-[0.12em] text-euphoria-muted">
              <tr>
                <th className="border-b border-white/10 px-4 py-3">Rank</th>
                <th className="border-b border-white/10 px-4 py-3">Account</th>
                <th className="border-b border-white/10 px-4 py-3">Selected metric</th>
                <th className="border-b border-white/10 px-4 py-3">Volume</th>
                <th className="border-b border-white/10 px-4 py-3">Taps</th>
                <th className="border-b border-white/10 px-4 py-3">Net PNL (Est.)</th>
                <th className="border-b border-white/10 px-4 py-3">Payout candidate</th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row, index) => (
                <tr key={row.address} className="border-b border-white/[0.06]">
                  <td className="px-4 py-3 font-mono text-white">{index + 1}</td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/traders/${row.address}`}
                      className="font-mono text-xs font-bold text-euphoria-pink transition hover:text-euphoria-magenta"
                    >
                      {row.shortAddress}
                    </Link>
                  </td>
                  <td className="px-4 py-3 font-mono font-black text-euphoria-cyan">{metricLabel(row, mode)}</td>
                  <td className="px-4 py-3 font-mono text-white">{formatUsd(row.volumeUsd, { compact: true })}</td>
                  <td className="px-4 py-3 font-mono text-white">
                    {formatInteger(row.activityEvents ?? row.transferBets)}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {formatOptionalUsd(row.accountPnlUsd ?? row.pnlUsd, { compact: true, signed: true })}
                  </td>
                  <td className="px-4 py-3 font-mono font-bold text-white">
                    {formatOptionalUsd(row.leaderboardPayoutUsd ?? row.estimatedLeaderboardPnlUsd, {
                      compact: true,
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {visibleRows.length === 0 ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-euphoria-muted">
          No on-chain account records match the current search.
        </div>
      ) : null}
    </section>
  );
}
