"use client";

import { useEffect, useState } from "react";

type FreshnessBadgeProps = {
  dataSource: "remote" | "fallback";
  generatedAt: string;
  publicGoldFresh?: boolean;
  renderedAt: string;
};

function getFreshnessState({
  dataSource,
  generatedAt,
  publicGoldFresh,
  nowMs,
}: Omit<FreshnessBadgeProps, "renderedAt"> & { nowMs: number }) {
  const timestamp = new Date(generatedAt).getTime();
  if (!Number.isFinite(timestamp)) {
    return {
      isWarning: true,
      status: "Check freshness",
      label: "Freshness unknown",
    };
  }

  const elapsedMs = Math.max(0, nowMs - timestamp);
  const elapsedMinutes = Math.floor(elapsedMs / 60_000);
  const elapsedHours = Math.floor(elapsedMinutes / 60);
  const isStale = elapsedMs > 20 * 60_000;
  const isWarning = dataSource === "fallback" || isStale || publicGoldFresh === false;

  let label = "Updated just now";
  if (elapsedMinutes >= 1 && elapsedMinutes < 60) {
    label = `Updated ${elapsedMinutes}m ago`;
  } else if (elapsedHours >= 1 && elapsedHours < 48) {
    label = `Updated ${elapsedHours}h ago`;
  } else if (elapsedHours >= 48) {
    label = `Updated ${Math.floor(elapsedHours / 24)}d ago`;
  }

  return {
    isWarning,
    status: dataSource === "fallback" ? "Fallback data" : isWarning ? "Check freshness" : "Fresh",
    label,
  };
}

export function FreshnessBadge({ dataSource, generatedAt, publicGoldFresh, renderedAt }: FreshnessBadgeProps) {
  const [state, setState] = useState(() =>
    getFreshnessState({
      dataSource,
      generatedAt,
      publicGoldFresh,
      nowMs: new Date(renderedAt).getTime(),
    }),
  );

  useEffect(() => {
    function update() {
      setState(
        getFreshnessState({
          dataSource,
          generatedAt,
          publicGoldFresh,
          nowMs: Date.now(),
        }),
      );
    }

    update();
    const interval = window.setInterval(update, 30_000);
    return () => window.clearInterval(interval);
  }, [dataSource, generatedAt, publicGoldFresh]);

  return (
    <div
      className={
        state.isWarning
          ? "inline-flex flex-wrap items-center gap-2 rounded-md border border-euphoria-red/40 bg-euphoria-red/10 px-3 py-2 text-xs font-bold text-euphoria-red"
          : "inline-flex flex-wrap items-center gap-2 rounded-md border border-euphoria-green/35 bg-euphoria-green/10 px-3 py-2 text-xs font-bold text-euphoria-green"
      }
    >
      <span className={state.isWarning ? "h-2 w-2 rounded-full bg-euphoria-red" : "h-2 w-2 rounded-full bg-euphoria-green"} />
      <span>{state.status}</span>
      <span className="text-white/40">·</span>
      <span>{state.label}</span>
    </div>
  );
}
