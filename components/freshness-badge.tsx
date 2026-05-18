"use client";

import { useEffect, useState } from "react";

import { formatDateTime } from "@/lib/format";
import type { PublicDashboardMetadata } from "@/lib/types";

type FreshnessBadgeProps = {
  dataSource: "remote" | "fallback";
  metadata: PublicDashboardMetadata;
  renderedAt: string;
};

function elapsedLabel(seconds: number | null) {
  if (seconds == null || !Number.isFinite(seconds)) return "unknown";
  const safeSeconds = Math.max(0, seconds);
  if (safeSeconds < 60) return "just now";
  const minutes = Math.floor(safeSeconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 48) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function secondsSince(value: string | null | undefined, nowMs: number) {
  if (!value) return null;
  const timestamp = new Date(value).getTime();
  if (!Number.isFinite(timestamp)) return null;
  return Math.floor((nowMs - timestamp) / 1000);
}

function classifyFeed(dataSource: "remote" | "fallback", generatedAgeSeconds: number | null) {
  if (dataSource === "fallback") return { label: "Fallback", warning: true };
  if (generatedAgeSeconds == null) return { label: "Unknown", warning: true };
  if (generatedAgeSeconds > 15 * 60) return { label: "Stale", warning: true };
  return { label: "Fresh", warning: false };
}

function classifyOnchain(metadata: PublicDashboardMetadata, lagSeconds: number | null) {
  if (metadata.publicGoldFresh === false) return { label: "Stale", warning: true };
  if (lagSeconds == null) return { label: "Unknown", warning: true };
  if (lagSeconds <= 30 * 60) return { label: "Live", warning: false };
  if (lagSeconds <= 6 * 60 * 60) return { label: "Catching up", warning: true };
  return { label: "Stale", warning: true };
}

export function FreshnessBadge({ dataSource, metadata, renderedAt }: FreshnessBadgeProps) {
  const [nowMs, setNowMs] = useState(() => new Date(renderedAt).getTime());
  const dataThrough = metadata.analysisDataThrough ?? metadata.maxTimestamp ?? metadata.lastSeenAt ?? null;
  const generatedAgeSeconds = secondsSince(metadata.generatedAt, nowMs);
  const onchainLagSeconds = secondsSince(dataThrough, nowMs);
  const feed = classifyFeed(dataSource, generatedAgeSeconds);
  const onchain = classifyOnchain(metadata, onchainLagSeconds);
  const warning = feed.warning || onchain.warning;

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 30_000);
    return () => window.clearInterval(interval);
  }, []);

  return (
    <div
      className={
        warning
          ? "rounded-md border border-euphoria-red/35 bg-euphoria-red/10 px-3 py-2 text-xs font-bold text-euphoria-red"
          : "rounded-md border border-euphoria-green/35 bg-euphoria-green/10 px-3 py-2 text-xs font-bold text-euphoria-green"
      }
      title="Dashboard feed refreshed means the public JSON was rebuilt and uploaded. On-chain data through means the latest lifecycle event included in the metrics."
    >
      <div className="flex flex-wrap items-center gap-2">
        <span className={warning ? "h-2 w-2 rounded-full bg-euphoria-red" : "h-2 w-2 rounded-full bg-euphoria-green"} />
        <span>Dashboard feed: {feed.label}</span>
        <span className="text-white/40">·</span>
        <span>refreshed {elapsedLabel(generatedAgeSeconds)}</span>
      </div>
      <div className="mt-1 flex flex-wrap items-center gap-2 text-white/80">
        <span>On-chain index: {onchain.label}</span>
        <span className="text-white/35">·</span>
        <span>data through {dataThrough ? formatDateTime(dataThrough) : "—"}</span>
        <span className="text-white/35">·</span>
        <span>{elapsedLabel(onchainLagSeconds)} behind</span>
      </div>
    </div>
  );
}
