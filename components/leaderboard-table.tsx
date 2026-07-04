"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import { ArrowUpDown, Search } from "lucide-react";

import { cn, formatDate, formatInteger, formatOptionalPercent, formatOptionalUsd, formatUsd } from "@/lib/format";
import { traderDisplayName, traderSecondaryLabel } from "@/lib/trader-display";
import type { TraderRecord } from "@/lib/types";

type LeaderboardTableProps = {
  rows: TraderRecord[];
  title?: string;
};

function sortLabel(state: false | "asc" | "desc") {
  if (state === "asc") return "sorted ascending";
  if (state === "desc") return "sorted descending";
  return "sortable";
}

export function LeaderboardTable({ rows, title = "Leaderboard" }: LeaderboardTableProps) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [sorting, setSorting] = useState<SortingState>([
    { id: "volumeUsd", desc: true },
  ]);

  const filteredRows = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return rows.filter((row) =>
      [
        row.address,
        row.shortAddress,
        row.displayName,
        row.username,
        row.publicUserId,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(normalizedQuery)),
    );
  }, [rows, query]);

  const columns = useMemo<ColumnDef<TraderRecord>[]>(
    () => [
      {
        accessorFn: (row) => row.volumeRank ?? row.rank,
        id: "volumeRank",
        header: "Volume Rank",
        cell: ({ row }) => (
          <span className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] px-2 font-mono text-xs text-white">
            {row.original.volumeRank ?? row.original.rank}
          </span>
        ),
      },
      {
        accessorKey: "shortAddress",
        id: "trader",
        header: "Trader",
        cell: ({ row }) => (
          <div className="flex min-w-[170px] flex-col gap-1">
            <Link
              href={`/traders/${row.original.address}`}
              className="text-sm font-bold text-euphoria-pink transition hover:text-euphoria-magenta"
              title={row.original.address}
              onClick={(event) => event.stopPropagation()}
            >
              {traderDisplayName(row.original)}
            </Link>
            <span className="font-mono text-[11px] text-euphoria-muted">{traderSecondaryLabel(row.original)}</span>
          </div>
        ),
      },
      {
        accessorKey: "volumeUsd",
        header: "All-Time Volume",
        cell: ({ row }) => <span className="font-mono font-bold text-white">{formatUsd(row.original.volumeUsd, { compact: true })}</span>,
      },
      {
        accessorKey: "accountPnlUsd",
        header: "Net PNL (Est.)",
        cell: ({ row }) => {
          const value = row.original.accountPnlUsd ?? row.original.pnlUsd;
          return (
            <span
              className={cn(
                "font-mono font-bold",
                typeof value === "number" && value < 0
                  ? "text-euphoria-red"
                  : typeof value === "number"
                    ? "text-euphoria-green"
                    : "text-white",
              )}
            >
              {formatOptionalUsd(value, {
                compact: true,
                signed: true,
              })}
            </span>
          );
        },
      },
      {
        accessorFn: (row) => row.leaderboardPayoutUsd ?? row.estimatedLeaderboardPnlUsd,
        id: "leaderboardScoreUsd",
        header: "Payout Candidate",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-euphoria-cyan">
            {formatOptionalUsd(row.original.leaderboardPayoutUsd ?? row.original.estimatedLeaderboardPnlUsd, {
              compact: true,
            })}
          </span>
        ),
      },
      {
        accessorKey: "activityEvents",
        header: "Taps",
        cell: ({ row }) => <span className="font-mono text-white">{formatInteger(row.original.activityEvents ?? row.original.transferBets)}</span>,
      },
      {
        accessorKey: "winRatePercent",
        header: "Platform Win Rate",
        cell: ({ row }) => <span className="font-mono text-white">{formatOptionalPercent(row.original.winRatePercent, 1)}</span>,
      },
      {
        accessorKey: "largestBetUsd",
        header: "Largest Bet",
        cell: ({ row }) => (
          <span className="font-mono text-white">
            {formatOptionalUsd(row.original.largestBetUsd, {
              compact: true,
            })}
          </span>
        ),
      },
      {
        accessorKey: "largestPlatformPayoutUsd",
        header: "Largest Payout",
        cell: ({ row }) => (
          <span className="font-mono font-bold text-euphoria-cyan">
            {formatOptionalUsd(row.original.largestPlatformPayoutUsd ?? row.original.largestSettlementUsd, {
              compact: true,
            })}
          </span>
        ),
      },
      {
        accessorKey: "firstSeen",
        header: "First Seen",
        cell: ({ row }) => <span className="font-mono text-euphoria-muted">{formatDate(row.original.firstSeen)}</span>,
      },
      {
        accessorKey: "lastActive",
        header: "Last Active",
        cell: ({ row }) => <span className="font-mono text-euphoria-muted">{formatDate(row.original.lastActive)}</span>,
      },
    ],
    [],
  );

  const table = useReactTable({
    data: filteredRows,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  const sortedRows = table.getRowModel().rows;

  return (
    <section className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4 shadow-panel backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">Public rankings</div>
          <h2 className="mt-1 text-xl font-bold text-white">{title}</h2>
        </div>
        <div className="flex flex-col gap-3 lg:min-w-[460px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-euphoria-muted" size={16} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search wallet address"
              className="w-full rounded-md border border-white/10 bg-white/[0.04] py-2 pl-9 pr-3 text-sm text-white outline-none transition placeholder:text-euphoria-muted focus:border-euphoria-pink/70"
            />
          </label>
        </div>
      </div>

      <div className="mt-4 hidden overflow-hidden rounded-lg border border-white/10 md:block">
        <div className="max-h-[930px] overflow-auto">
          <table className="w-full min-w-[1540px] border-collapse text-sm">
            <thead className="sticky top-0 z-10 bg-euphoria-panel/[0.98] text-left text-xs uppercase tracking-[0.12em] text-euphoria-muted backdrop-blur">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => {
                    const sorted = header.column.getIsSorted();
                    return (
                      <th key={header.id} className="border-b border-white/10 px-4 py-3">
                        <button
                          type="button"
                          onClick={header.column.getToggleSortingHandler()}
                          className="inline-flex items-center gap-2 text-left font-bold"
                          title={sortLabel(sorted)}
                        >
                          {flexRender(header.column.columnDef.header, header.getContext())}
                          <ArrowUpDown size={13} className={sorted ? "text-euphoria-pink" : "text-euphoria-muted"} />
                        </button>
                      </th>
                    );
                  })}
                </tr>
              ))}
            </thead>
            <tbody>
              {sortedRows.map((row) => (
                <tr
                  key={row.original.address}
                  onClick={() => router.push(`/traders/${row.original.address}`)}
                  className="cursor-pointer border-b border-white/[0.06] transition hover:bg-white/[0.045]"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3 text-euphoria-text">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:hidden">
        {sortedRows.map((row) => (
          <Link
            key={row.original.address}
            href={`/traders/${row.original.address}`}
            className="rounded-lg border border-white/10 bg-white/[0.035] p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-[0.14em] text-euphoria-muted">
                  Volume Rank {row.original.volumeRank ?? row.original.rank}
                </div>
                <div className="mt-1 text-sm font-bold text-euphoria-pink">{traderDisplayName(row.original)}</div>
                <div className="mt-1 font-mono text-xs text-euphoria-muted">{traderSecondaryLabel(row.original)}</div>
              </div>
              <div className="text-right text-lg font-bold text-white">
                {formatUsd(row.original.volumeUsd, { compact: true })}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">All-Time Volume</div>
                <div className="mt-1 font-bold text-white">{formatUsd(row.original.volumeUsd, { compact: true })}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Net PNL (Est.)</div>
                <div
                  className={
                    Number(row.original.accountPnlUsd ?? row.original.pnlUsd) < 0
                      ? "mt-1 font-bold text-euphoria-red"
                      : "mt-1 font-bold text-euphoria-green"
                  }
                >
                  {formatOptionalUsd(row.original.accountPnlUsd ?? row.original.pnlUsd, {
                    compact: true,
                    signed: true,
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Taps</div>
                <div className="mt-1 font-bold text-white">{formatInteger(row.original.activityEvents ?? row.original.transferBets)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Payout Candidate</div>
                <div className="mt-1 font-bold text-euphoria-cyan">
                  {formatOptionalUsd(row.original.leaderboardPayoutUsd ?? row.original.estimatedLeaderboardPnlUsd, {
                    compact: true,
                  })}
                </div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Win Rate</div>
                <div className="mt-1 font-bold text-white">{formatOptionalPercent(row.original.winRatePercent, 1)}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Largest Bet</div>
                <div className="mt-1 font-bold text-white">{formatOptionalUsd(row.original.largestBetUsd, { compact: true })}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Largest Payout</div>
                <div className="mt-1 font-bold text-euphoria-cyan">{formatOptionalUsd(row.original.largestPlatformPayoutUsd ?? row.original.largestSettlementUsd, { compact: true })}</div>
              </div>
              <div>
                <div className="text-xs uppercase tracking-[0.12em] text-euphoria-muted">Last Active</div>
                <div className="mt-1 font-bold text-white">{formatDate(row.original.lastActive)}</div>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {sortedRows.length === 0 ? (
        <div className="mt-4 rounded-lg border border-white/10 bg-white/[0.03] p-8 text-center text-sm text-euphoria-muted">
          No trader records match the current search.
        </div>
      ) : null}
    </section>
  );
}
