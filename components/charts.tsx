"use client";

import type { ReactNode } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Scatter,
  ScatterChart,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { formatDate, formatInteger, formatPercent, formatUsd } from "@/lib/format";
import type { ActivityPoint, ConcentrationCurvePoint, DistributionBucket, TraderActivityPoint, TraderRecord } from "@/lib/types";

export function ChartPanel({
  title,
  eyebrow,
  children,
}: {
  title: string;
  eyebrow?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4 shadow-panel backdrop-blur md:p-5">
      {eyebrow ? (
        <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-cyan">{eyebrow}</div>
      ) : null}
      <h3 className="mt-1 text-lg font-bold text-white">{title}</h3>
      <div className="mt-4">{children}</div>
    </section>
  );
}

function TooltipBox({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;

  return (
    <div className="rounded-md border border-white/10 bg-[#121212]/95 p-3 text-xs shadow-panel backdrop-blur">
      <div className="mb-2 font-bold text-white">{label}</div>
      <div className="space-y-1">
        {payload.map((entry: any) => {
          const key = String(entry.dataKey);
          const value = Number(entry.value ?? 0);
          const display =
            key.toLowerCase().includes("usd") || key.toLowerCase().includes("pnl")
              ? formatUsd(value, { signed: key.toLowerCase().includes("pnl"), compact: true })
              : key.toLowerCase().includes("percent")
                ? formatPercent(value)
                : formatInteger(value);

          return (
            <div key={key} className="flex items-center justify-between gap-6 text-euphoria-muted">
              <span>{entry.name ?? key}</span>
              <span style={{ color: entry.color }} className="font-bold">
                {display}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function SettlementDistributionChart({ buckets }: { buckets: DistributionBucket[] }) {
  return (
    <div className="h-[310px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={buckets} margin={{ top: 10, right: 10, left: -22, bottom: 26 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            dataKey="label"
            tick={{ fill: "#B2ACB8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={-18}
            textAnchor="end"
            height={54}
          />
          <YAxis tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" name="Settlements" radius={[5, 5, 1, 1]}>
            {buckets.map((bucket) => (
              <Cell key={bucket.label} fill="#FC8DF4" />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

type PnlDistributionBucket = {
  label: string;
  count: number;
  percent: number;
  tone: "loss" | "profit";
};

type PnlDistributionStats = {
  traderCount: number;
  averagePnlUsd: number | null;
  medianPnlUsd: number | null;
  avgWinRatePercent: number | null;
  avgTapsPerTrader: number | null;
  averageBetUsd: number | null;
  bestTrader?: { address: string; value: number } | null;
  worstTrader?: { address: string; value: number } | null;
  profitSharePercent: number;
  lossSharePercent: number;
};

function shortAddress(address: string) {
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function PnlDistributionChart({
  buckets,
  stats,
}: {
  buckets: PnlDistributionBucket[];
  stats: PnlDistributionStats;
}) {
  const maxCount = Math.max(...buckets.map((bucket) => bucket.count), 1);
  const statCards = [
    { label: "Average Net PNL (Est.)", value: stats.averagePnlUsd == null ? "—" : formatUsd(stats.averagePnlUsd, { signed: true }) },
    { label: "Median Net PNL (Est.)", value: stats.medianPnlUsd == null ? "—" : formatUsd(stats.medianPnlUsd, { signed: true }) },
    { label: "Avg Win Rate", value: stats.avgWinRatePercent == null ? "—" : formatPercent(stats.avgWinRatePercent) },
    { label: "Avg Taps / Trader", value: stats.avgTapsPerTrader == null ? "—" : formatInteger(stats.avgTapsPerTrader) },
    {
      label: "Best Trader",
      value: stats.bestTrader ? formatUsd(stats.bestTrader.value, { signed: true, compact: true }) : "—",
      detail: stats.bestTrader ? shortAddress(stats.bestTrader.address) : undefined,
    },
    {
      label: "Worst Trader",
      value: stats.worstTrader ? formatUsd(stats.worstTrader.value, { signed: true, compact: true }) : "—",
      detail: stats.worstTrader ? shortAddress(stats.worstTrader.address) : undefined,
    },
    { label: "Avg Bet Size", value: stats.averageBetUsd == null ? "—" : formatUsd(stats.averageBetUsd, { compact: true }) },
    { label: "Traders", value: formatInteger(stats.traderCount) },
  ];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="text-base font-bold text-euphoria-pink">Accounts by estimated result</div>
        <div className="text-sm text-euphoria-muted">{formatInteger(stats.traderCount)} traders</div>
      </div>

      <div className="grid h-[270px] grid-cols-4 items-end gap-x-4 gap-y-5 border-y border-white/[0.06] py-7 sm:grid-cols-8 sm:gap-3">
        {buckets.map((bucket) => {
          const heightPercent = Math.max(6, (bucket.count / maxCount) * 100);
          const isProfit = bucket.tone === "profit";
          return (
            <div key={bucket.label} className="flex h-full min-w-0 flex-col items-center justify-end gap-2">
              <div className={isProfit ? "text-xs font-bold text-euphoria-green" : "text-xs font-bold text-euphoria-red"}>
                {formatInteger(bucket.count)}
              </div>
              <div
                className={
                  isProfit
                    ? "w-full max-w-[34px] rounded-t-md bg-euphoria-green shadow-[0_0_20px_rgba(47,211,116,0.35)]"
                    : "w-full max-w-[34px] rounded-t-md bg-gradient-to-t from-euphoria-red to-euphoria-magenta shadow-[0_0_20px_rgba(255,58,55,0.35)]"
                }
                style={{ height: `${heightPercent}%` }}
              />
              <div className={isProfit ? "min-h-[28px] text-center text-[10px] font-bold leading-tight text-euphoria-green" : "min-h-[28px] text-center text-[10px] font-bold leading-tight text-euphoria-red"}>
                {bucket.label}
              </div>
              <div className="text-[10px] text-euphoria-muted">{formatPercent(bucket.percent)}</div>
            </div>
          );
        })}
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between text-xs font-bold">
          <span className="text-euphoria-green">{formatPercent(stats.profitSharePercent)} in profit</span>
          <span className="text-euphoria-red">{formatPercent(stats.lossSharePercent)} in loss</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-euphoria-red/25">
          <div className="h-full bg-euphoria-green" style={{ width: `${stats.profitSharePercent}%` }} />
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div key={card.label} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
            <div className="text-[11px] font-bold uppercase tracking-[0.14em] text-euphoria-muted">{card.label}</div>
            <div
              className={
                card.value.startsWith("-")
                  ? "mt-2 font-mono text-lg font-black text-euphoria-red"
                  : card.value.startsWith("+")
                    ? "mt-2 font-mono text-lg font-black text-euphoria-green"
                    : "mt-2 font-mono text-lg font-black text-white"
              }
            >
              {card.value}
            </div>
            {card.detail ? <div className="mt-1 font-mono text-xs text-euphoria-muted">{card.detail}</div> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

export function TimeSeriesChart({
  data,
  mode,
}: {
  data: ActivityPoint[];
  mode: "volume" | "activity" | "whales" | "newTraders";
}) {
  if (mode === "activity") {
    return (
      <div className="h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipBox />} />
            <Bar dataKey="activityEvents" name="Total taps" fill="#FFBAE0" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="activeTraders" name="Active accounts" stroke="#FC8DF4" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (mode === "newTraders") {
    return (
      <div className="h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipBox />} />
            <Bar dataKey="newTraders" name="New accounts" fill="#2FD374" radius={[4, 4, 0, 0]} />
            <Line type="monotone" dataKey="activeTraders" name="Active accounts" stroke="#FC8DF4" strokeWidth={2.5} dot={false} />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (mode === "whales") {
    return (
      <div className="h-[290px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
            <defs>
              <linearGradient id="whaleGradient" x1="0" x2="0" y1="0" y2="1">
                <stop offset="0%" stopColor="#FC8DF4" stopOpacity={0.32} />
                <stop offset="100%" stopColor="#FC8DF4" stopOpacity={0.03} />
              </linearGradient>
            </defs>
            <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
            <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <YAxis tickFormatter={(value) => `${value}%`} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
            <Tooltip content={<TooltipBox />} />
            <Area
              type="monotone"
              dataKey="whaleSharePercent"
              name="Large-account share"
              stroke="#FC8DF4"
              strokeWidth={2.5}
              fill="url(#whaleGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    );
  }

  return (
    <div className="h-[290px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id="volumeGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FFBAE0" stopOpacity={0.36} />
              <stop offset="100%" stopColor="#FFBAE0" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => formatUsd(Number(value), { compact: true })} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<TooltipBox />} />
          <Area
            type="monotone"
            dataKey="cumulativeVolumeUsd"
            name="Cumulative volume"
            stroke="#FFBAE0"
            strokeWidth={2.5}
            fill="url(#volumeGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

type ScatterMode = "pnl" | "winRate";

function AccountScatterTooltip({ active, payload, mode }: any & { mode: ScatterMode }) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;

  return (
    <div className="rounded-md border border-white/10 bg-[#121212]/95 p-3 text-xs shadow-panel backdrop-blur">
      <div className="mb-2 font-mono font-bold text-white">{point.shortAddress}</div>
      <div className="space-y-1 text-euphoria-muted">
        <div className="flex justify-between gap-6">
          <span>Volume</span>
          <span className="font-bold text-white">{formatUsd(point.volumeUsd, { compact: true })}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Net PNL (Est.)</span>
          <span className={point.pnlUsd < 0 ? "font-bold text-euphoria-red" : "font-bold text-euphoria-green"}>
            {formatUsd(point.pnlUsd, { signed: true, compact: true })}
          </span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Win rate</span>
          <span className="font-bold text-white">{formatPercent(point.winRatePercent)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Taps</span>
          <span className="font-bold text-white">{formatInteger(point.taps)}</span>
        </div>
      </div>
      <div className="mt-2 text-[10px] uppercase tracking-[0.12em] text-euphoria-muted">
        {mode === "pnl" ? "Volume vs estimated account result" : "Volume vs account win rate"}
      </div>
    </div>
  );
}

export function AccountScatterChart({
  traders,
  mode,
}: {
  traders: TraderRecord[];
  mode: ScatterMode;
}) {
  const points = traders
    .map((trader) => ({
      shortAddress: trader.shortAddress,
      volumeUsd: trader.volumeUsd,
      pnlUsd: trader.accountPnlUsd ?? trader.pnlUsd,
      winRatePercent: trader.winRatePercent,
      taps: trader.activityEvents ?? trader.transferBets,
    }))
    .filter(
      (point): point is typeof point & { pnlUsd: number; winRatePercent: number } =>
        typeof point.pnlUsd === "number" &&
        Number.isFinite(point.pnlUsd) &&
        typeof point.winRatePercent === "number" &&
        Number.isFinite(point.winRatePercent) &&
        Number.isFinite(point.volumeUsd),
    );

  const yKey = mode === "pnl" ? "pnlUsd" : "winRatePercent";
  const yName = mode === "pnl" ? "Net PNL (Est.)" : "Platform Win Rate";

  if (!points.length) {
    return <div className="flex h-[290px] items-center justify-center text-sm text-euphoria-muted">No account points available.</div>;
  }

  return (
    <div className="h-[290px]">
      <ResponsiveContainer width="100%" height="100%">
        <ScatterChart margin={{ top: 10, right: 14, left: -8, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis
            type="number"
            dataKey="volumeUsd"
            name="Volume"
            tickFormatter={(value) => formatUsd(Number(value), { compact: true })}
            tick={{ fill: "#B2ACB8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <YAxis
            type="number"
            dataKey={yKey}
            name={yName}
            tickFormatter={(value) =>
              mode === "pnl" ? formatUsd(Number(value), { compact: true }) : formatPercent(Number(value), 0)
            }
            tick={{ fill: "#B2ACB8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<AccountScatterTooltip mode={mode} />} cursor={{ stroke: "rgba(255,255,255,0.18)" }} />
          <Scatter data={points} name={yName}>
            {points.map((point) => (
              <Cell key={`${point.shortAddress}-${point.volumeUsd}-${point.pnlUsd}`} fill={point.pnlUsd < 0 ? "#FF3A37" : "#2FD374"} />
            ))}
          </Scatter>
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
}

function OutcomeTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="rounded-md border border-white/10 bg-[#121212]/95 p-3 text-xs shadow-panel backdrop-blur">
      <div className="font-bold text-white">{point.name}</div>
      <div className="mt-1 text-euphoria-muted">
        {formatInteger(point.value)} taps · {formatPercent(point.percent)}
      </div>
    </div>
  );
}

export function TapsOutcomeChart({
  traders,
  buckets,
}: {
  traders: TraderRecord[];
  buckets?: DistributionBucket[];
}) {
  const derivedWins = traders.reduce((sum, trader) => sum + (trader.winCount ?? 0), 0);
  const derivedLosses = traders.reduce((sum, trader) => sum + (trader.lossCount ?? 0), 0);
  const sourceRows = buckets?.length
    ? buckets.map((bucket) => ({
        name: bucket.label,
        value: bucket.count,
        percent: bucket.percent,
        fill: bucket.tone === "loss" || bucket.label.toLowerCase().includes("loss") ? "#FF3A37" : "#2FD374",
      }))
    : [
        { name: "Wins", value: derivedWins, percent: undefined, fill: "#2FD374" },
        { name: "Losses", value: derivedLosses, percent: undefined, fill: "#FF3A37" },
      ];
  const total = sourceRows.reduce((sum, row) => sum + row.value, 0);

  if (!total) {
    return <div className="flex h-[290px] items-center justify-center text-sm text-euphoria-muted">No tap outcomes available.</div>;
  }

  const rows = sourceRows.map((row) => ({
    ...row,
    percent: row.percent ?? (row.value / total) * 100,
  }));

  return (
    <div className="grid min-h-[290px] gap-4 md:grid-cols-[1.1fr_0.9fr] md:items-center">
      <div className="h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<OutcomeTooltip />} />
            <Pie data={rows} dataKey="value" nameKey="name" innerRadius="58%" outerRadius="86%" paddingAngle={3}>
              {rows.map((row) => (
                <Cell key={row.name} fill={row.fill} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.name} className="rounded-lg border border-white/10 bg-white/[0.035] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full" style={{ background: row.fill }} />
                <span className="text-xs font-bold uppercase tracking-[0.12em] text-euphoria-muted">{row.name}</span>
              </div>
              <span className="font-mono text-sm font-bold text-white">{formatPercent(row.percent)}</span>
            </div>
            <div className="mt-2 font-mono text-2xl font-black text-white">{formatInteger(row.value)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function TapsPerAccountChart({
  traders,
  buckets,
}: {
  traders: TraderRecord[];
  buckets?: DistributionBucket[];
}) {
  const rows = buckets?.length ? buckets : [
    { label: "1 tap", min: 1, max: 1 },
    { label: "2-10 taps", min: 2, max: 10 },
    { label: "11-100 taps", min: 11, max: 100 },
    { label: "100+ taps", min: 101, max: Infinity },
  ].map((bucket) => ({
    label: bucket.label,
    count: traders.filter((trader) => {
      const taps = trader.activityEvents ?? trader.transferBets;
      return taps >= bucket.min && taps <= bucket.max;
    }).length,
  }));

  return (
    <div className="h-[290px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={rows} margin={{ top: 10, right: 10, left: -22, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="label" tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<TooltipBox />} cursor={{ fill: "rgba(255,255,255,0.04)" }} />
          <Bar dataKey="count" name="Accounts" radius={[5, 5, 1, 1]}>
            {rows.map((bucket, index) => (
              <Cell key={bucket.label} fill={index % 2 === 0 ? "#FC8DF4" : "#FFBAE0"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

function ConcentrationTooltip({ active, payload }: any) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="rounded-md border border-white/10 bg-[#121212]/95 p-3 text-xs shadow-panel backdrop-blur">
      <div className="font-bold text-white">Rank {point.rank}</div>
      <div className="mt-2 space-y-1 text-euphoria-muted">
        <div className="flex justify-between gap-6">
          <span>Cumulative volume</span>
          <span className="font-bold text-white">{formatPercent(point.cumulativeSharePercent)}</span>
        </div>
        <div className="flex justify-between gap-6">
          <span>Account</span>
          <span className="font-mono font-bold text-euphoria-pink">{point.shortAddress}</span>
        </div>
      </div>
    </div>
  );
}

export function ConcentrationCurveChart({
  traders,
  points: providedPoints,
}: {
  traders?: TraderRecord[];
  points?: ConcentrationCurvePoint[];
}) {
  const sorted = [...(traders ?? [])].filter((trader) => trader.volumeUsd > 0).sort((a, b) => b.volumeUsd - a.volumeUsd);
  const totalVolume = sorted.reduce((sum, trader) => sum + trader.volumeUsd, 0);
  let runningVolume = 0;
  const points = providedPoints?.length ? providedPoints : sorted.slice(0, 50).map((trader, index) => {
    runningVolume += trader.volumeUsd;
    return {
      rank: index + 1,
      shortAddress: trader.shortAddress,
      cumulativeSharePercent: totalVolume > 0 ? (runningVolume / totalVolume) * 100 : 0,
    };
  });

  if (!points.length) {
    return <div className="flex h-[290px] items-center justify-center text-sm text-euphoria-muted">No concentration data available.</div>;
  }

  return (
    <div className="h-[290px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 10, right: 12, left: -18, bottom: 0 }}>
          <defs>
            <linearGradient id="concentrationGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#FC8DF4" stopOpacity={0.28} />
              <stop offset="100%" stopColor="#FC8DF4" stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="rank" tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis tickFormatter={(value) => `${Number(value).toFixed(0)}%`} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <Tooltip content={<ConcentrationTooltip />} />
          <Area
            type="monotone"
            dataKey="cumulativeSharePercent"
            name="Cumulative volume share"
            stroke="#FC8DF4"
            strokeWidth={2.5}
            fill="url(#concentrationGradient)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function TraderProfileChart({
  data,
  mode,
}: {
  data: TraderActivityPoint[];
  mode: "activity" | "cumulative" | "volume";
}) {
  const dataKey = mode === "activity" ? "activityEvents" : mode === "cumulative" ? "cumulativeVolumeUsd" : "volumeUsd";
  const color = mode === "activity" ? "#FC8DF4" : mode === "cumulative" ? "#FFBAE0" : "#FF3A37";
  const name = mode === "activity" ? "Total taps" : mode === "cumulative" ? "Cumulative volume" : "Volume";

  return (
    <div className="h-[260px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 12, left: -8, bottom: 0 }}>
          <defs>
            <linearGradient id={`profile-${mode}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.36} />
              <stop offset="100%" stopColor={color} stopOpacity={0.03} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="rgba(255,255,255,0.06)" vertical={false} />
          <XAxis dataKey="date" tickFormatter={formatDate} tick={{ fill: "#B2ACB8", fontSize: 11 }} tickLine={false} axisLine={false} />
          <YAxis
            tickFormatter={(value) =>
              mode === "activity" ? formatInteger(Number(value)) : formatUsd(Number(value), { compact: true })
            }
            tick={{ fill: "#B2ACB8", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<TooltipBox />} />
          <Area type="monotone" dataKey={dataKey} name={name} stroke={color} strokeWidth={2.5} fill={`url(#profile-${mode})`} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
