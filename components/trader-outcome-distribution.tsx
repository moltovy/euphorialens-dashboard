"use client";

import { useMemo, useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { cn, formatInteger, formatUsd } from "@/lib/format";
import type { TraderRecord } from "@/lib/types";

type MetricKey = "pnl" | "volume" | "taps";
type RangeKey = "core" | "full";

type MetricConfig = {
  label: string;
  axisLabel: string;
  value: (trader: TraderRecord) => number | null;
  format: (value: number) => string;
  positiveOnly: boolean;
};

type PercentilePoint = {
  percentile: number;
  value: number;
  rank: number;
};

type DistributionStats = {
  min: number;
  p2: number;
  p25: number;
  p50: number;
  p75: number;
  p98: number;
  max: number;
};

const METRICS: Record<MetricKey, MetricConfig> = {
  pnl: {
    label: "Net PNL (Est.)",
    axisLabel: "Net PNL (Est.)",
    value: (trader) => trader.accountPnlUsd ?? trader.pnlUsd ?? null,
    format: (value) => formatUsd(value, { signed: true }),
    positiveOnly: false,
  },
  volume: {
    label: "Volume",
    axisLabel: "Volume",
    value: (trader) => trader.volumeUsd,
    format: (value) => formatUsd(value),
    positiveOnly: true,
  },
  taps: {
    label: "Taps",
    axisLabel: "Taps",
    value: (trader) => trader.activityEvents ?? trader.transferBets ?? null,
    format: (value) => formatInteger(value),
    positiveOnly: true,
  },
};

function percentile(sortedValues: number[], pct: number) {
  if (!sortedValues.length) return 0;
  if (sortedValues.length === 1) return sortedValues[0];
  const index = (pct / 100) * (sortedValues.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedValues[lower] + (sortedValues[upper] - sortedValues[lower]) * weight;
}

function makeStats(sortedValues: number[]): DistributionStats {
  return {
    min: sortedValues[0],
    p2: percentile(sortedValues, 2),
    p25: percentile(sortedValues, 25),
    p50: percentile(sortedValues, 50),
    p75: percentile(sortedValues, 75),
    p98: percentile(sortedValues, 98),
    max: sortedValues[sortedValues.length - 1],
  };
}

function axisDomain(metric: MetricConfig, lower: number, upper: number): [number, number] {
  if (lower === upper) {
    const padding = Math.max(Math.abs(lower) * 0.1, 1);
    return metric.positiveOnly ? [0, lower + padding] : [lower - padding, upper + padding];
  }

  const padding = Math.max((upper - lower) * 0.08, metric.positiveOnly ? 1 : 0.5);
  if (metric.positiveOnly) {
    return [0, upper + padding];
  }
  return [lower - padding, upper + padding];
}

function buildPercentileCurve(sortedValues: number[], range: RangeKey) {
  const start = range === "core" ? 2 : 0;
  const end = range === "core" ? 98 : 100;
  const steps = 220;

  return Array.from({ length: steps + 1 }, (_, index): PercentilePoint => {
    const percentileValue = start + ((end - start) * index) / steps;
    const rank = Math.round((percentileValue / 100) * (sortedValues.length - 1)) + 1;
    return {
      percentile: percentileValue,
      value: percentile(sortedValues, percentileValue),
      rank,
    };
  });
}

function formatAxisValue(metricKey: MetricKey, value: number) {
  if (metricKey === "taps") return formatInteger(Math.round(value));
  const signed = metricKey === "pnl";
  if (Math.abs(value) >= 1000) return formatUsd(value, { compact: true, signed });
  return formatUsd(value, { signed });
}

function valueTone(metricKey: MetricKey, value: number) {
  if (metricKey !== "pnl") return "text-white";
  if (value > 0) return "text-euphoria-green";
  if (value < 0) return "text-euphoria-red";
  return "text-white";
}

function SegmentButton({
  active,
  children,
  onClick,
}: {
  active: boolean;
  children: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "min-h-9 rounded-md px-3 py-1.5 text-xs font-bold transition",
        active
          ? "border border-euphoria-pink/70 bg-euphoria-pink/15 text-white shadow-[0_0_18px_rgba(252,141,244,0.12)]"
          : "border border-white/10 bg-white/[0.035] text-euphoria-muted hover:border-euphoria-pink/40 hover:text-white",
      )}
    >
      {children}
    </button>
  );
}

function StatCard({
  label,
  value,
  metric,
  metricKey,
}: {
  label: string;
  value: number;
  metric: MetricConfig;
  metricKey: MetricKey;
}) {
  return (
    <div className="rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2">
      <div className="text-[10px] font-bold uppercase tracking-[0.14em] text-euphoria-muted">{label}</div>
      <div className={cn("mt-1 text-sm font-black", valueTone(metricKey, value))}>{metric.format(value)}</div>
    </div>
  );
}

function PercentileTooltip({
  active,
  payload,
  metric,
  total,
}: {
  active?: boolean;
  payload?: Array<{ payload?: PercentilePoint }>;
  metric: MetricConfig;
  total: number;
}) {
  if (!active || !payload?.length) return null;
  const row = payload[0]?.payload;
  if (!row) return null;

  return (
    <div className="rounded-md border border-white/10 bg-[#101010]/95 p-3 text-xs shadow-panel backdrop-blur">
      <div className="font-black text-white">P{row.percentile.toFixed(row.percentile % 1 === 0 ? 0 : 1)}</div>
      <div className="mt-2 space-y-1 text-euphoria-muted">
        <div className="flex justify-between gap-8">
          <span>{metric.axisLabel}</span>
          <span className="font-black text-white">{metric.format(row.value)}</span>
        </div>
        <div className="flex justify-between gap-8">
          <span>Account position</span>
          <span className="font-bold text-white">
            {formatInteger(row.rank)} / {formatInteger(total)}
          </span>
        </div>
      </div>
    </div>
  );
}

export function TraderOutcomeDistribution({ traders }: { traders: TraderRecord[] }) {
  const [metricKey, setMetricKey] = useState<MetricKey>("pnl");
  const [range, setRange] = useState<RangeKey>("core");
  const metric = METRICS[metricKey];

  const distribution = useMemo(() => {
    const rows = traders
      .map((trader) => {
        const taps = trader.activityEvents ?? trader.transferBets ?? 0;
        const volumeUsd = trader.volumeUsd ?? 0;
        const value = metric.value(trader);
        return {
          value,
          coreEligible: taps >= 3 || volumeUsd >= 10,
        };
      })
      .filter(
        (row): row is { value: number; coreEligible: boolean } =>
          typeof row.value === "number" && Number.isFinite(row.value),
      );

    const scopedRows = range === "core" ? rows.filter((row) => row.coreEligible) : rows;
    const values = scopedRows.map((row) => row.value).sort((a, b) => a - b);

    if (!values.length) {
      return {
        curve: [] as PercentilePoint[],
        stats: null as DistributionStats | null,
        xDomain: [0, 100] as [number, number],
        yDomain: [0, 1] as [number, number],
        visibleCount: 0,
        totalCount: rows.length,
      };
    }

    const stats = makeStats(values);
    const lower = range === "core" ? stats.p2 : stats.min;
    const upper = range === "core" ? stats.p98 : stats.max;

    return {
      curve: buildPercentileCurve(values, range),
      stats,
      xDomain: range === "core" ? ([2, 98] as [number, number]) : ([0, 100] as [number, number]),
      yDomain: axisDomain(metric, lower, upper),
      visibleCount: values.length,
      totalCount: rows.length,
    };
  }, [metric, range, traders]);

  const stats = distribution.stats;
  const hasValues = distribution.curve.length > 0 && stats != null;
  const showZeroLine =
    metricKey === "pnl" && distribution.yDomain[0] < 0 && distribution.yDomain[1] > 0;

  return (
    <section className="mb-5 rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4 shadow-panel backdrop-blur md:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.16em] text-euphoria-pink">Accounts</div>
          <h2 className="mt-1 text-xl font-bold text-white">Trader Outcome Distribution</h2>
          <p className="mt-2 text-sm leading-6 text-euphoria-muted">
            Empirical percentile curve of platform trading accounts by selected metric, with raw values on the vertical axis.
          </p>
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
          <div className="flex flex-wrap gap-2">
            {(["pnl", "volume", "taps"] as MetricKey[]).map((key) => (
              <SegmentButton key={key} active={metricKey === key} onClick={() => setMetricKey(key)}>
                {METRICS[key].label}
              </SegmentButton>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            <SegmentButton active={range === "core"} onClick={() => setRange("core")}>
              Core range
            </SegmentButton>
            <SegmentButton active={range === "full"} onClick={() => setRange("full")}>
              Full range
            </SegmentButton>
          </div>
        </div>
      </div>

      <div className="mt-5 rounded-lg border border-white/[0.08] bg-white/[0.025] p-3 md:p-4">
        <div className="mb-3 flex flex-col gap-2 text-sm text-euphoria-muted sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-black text-white">{formatInteger(distribution.visibleCount)}</span> accounts shown
            {range === "core" ? (
              <span> - activity &gt;= 3 taps or volume &gt;= $10</span>
            ) : (
              <span> - full public trader set</span>
            )}
          </div>
          <div className="text-xs uppercase tracking-[0.14em] text-euphoria-muted">
            {range === "core" ? "P2-P98 focus" : "Full raw range"}
          </div>
        </div>

        {hasValues && stats ? (
          <>
            <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
              <StatCard label="Min" value={stats.min} metric={metric} metricKey={metricKey} />
              <StatCard label="P2" value={stats.p2} metric={metric} metricKey={metricKey} />
              <StatCard label="P25" value={stats.p25} metric={metric} metricKey={metricKey} />
              <StatCard label="P50" value={stats.p50} metric={metric} metricKey={metricKey} />
              <StatCard label="P75" value={stats.p75} metric={metric} metricKey={metricKey} />
              <StatCard label="Max" value={stats.max} metric={metric} metricKey={metricKey} />
            </div>

            <div className="mt-5 h-[360px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={distribution.curve} margin={{ top: 10, right: 18, left: 4, bottom: 18 }}>
                  <CartesianGrid stroke="rgba(255,255,255,0.055)" vertical={false} />
                  <XAxis
                    type="number"
                    dataKey="percentile"
                    domain={distribution.xDomain}
                    ticks={range === "core" ? [2, 10, 25, 50, 75, 90, 98] : [0, 10, 25, 50, 75, 90, 100]}
                    tickFormatter={(value) => `P${Number(value).toFixed(0)}`}
                    tick={{ fill: "#B2ACB8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    label={{ value: "Trading account percentile", fill: "#B2ACB8", fontSize: 11, dy: 18 }}
                  />
                  <YAxis
                    domain={distribution.yDomain}
                    tickFormatter={(value) => formatAxisValue(metricKey, Number(value))}
                    tick={{ fill: "#B2ACB8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                    width={76}
                    label={{ value: metric.axisLabel, angle: -90, position: "insideLeft", fill: "#B2ACB8", fontSize: 11 }}
                  />
                  <Tooltip
                    content={<PercentileTooltip metric={metric} total={distribution.visibleCount} />}
                    cursor={{ stroke: "rgba(255,255,255,0.18)", strokeDasharray: "4 4" }}
                  />
                  {showZeroLine ? (
                    <ReferenceLine y={0} stroke="rgba(255,255,255,0.34)" strokeDasharray="4 5" />
                  ) : null}
                  {[25, 50, 75].map((marker) => (
                    <ReferenceLine
                      key={marker}
                      x={marker}
                      stroke="rgba(255,255,255,0.075)"
                      strokeDasharray="3 8"
                    />
                  ))}
                  <Line
                    type="monotoneX"
                    dataKey="value"
                    name={metric.axisLabel}
                    stroke="#F67DE7"
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: "#FFBAE0", stroke: "#101010", strokeWidth: 2 }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>

            <div className="mt-3 rounded-md border border-white/[0.08] bg-white/[0.025] px-3 py-2 text-xs leading-5 text-euphoria-muted">
              {range === "core"
                ? `Core range keeps the curve readable by focusing the axis on P2-P98. The full tails remain visible in the Min and Max summary values.`
                : `Full range plots the complete raw span, including outliers that can compress the middle of the distribution.`}
            </div>
          </>
        ) : (
          <div className="flex h-[320px] items-center justify-center text-sm text-euphoria-muted">
            No trader outcome data is available for this selection.
          </div>
        )}
      </div>

      <p className="mt-3 text-xs leading-5 text-euphoria-muted">
        Net PNL (Est.) reflects platform account outcomes and is not equivalent to wallet-level realized PNL. Accounts do not
        represent real-world user identities.
      </p>
    </section>
  );
}
