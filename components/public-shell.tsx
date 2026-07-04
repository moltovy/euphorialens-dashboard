import type { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BarChart3,
  CircleDollarSign,
  ExternalLink,
  Trophy,
  Users,
  Waves,
} from "lucide-react";

import { asOfUtc as fallbackAsOfUtc, euphoriaUrl, tradeUrl, xUrl } from "@/lib/dashboard-data";
import { formatDateTime } from "@/lib/format";
import { creatorXUrl } from "@/lib/links";
import type { PublicDashboardMetadata } from "@/lib/types";

type PublicShellProps = {
  active: string;
  asOfUtc?: string;
  dataSource?: "remote" | "fallback";
  metadata?: PublicDashboardMetadata;
  children: ReactNode;
};

const navItems = [
  { href: "/", label: "Overview", icon: BarChart3 },
  { href: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { href: "/traders", label: "Traders", icon: Users },
  { href: "/whales", label: "Concentration", icon: Waves },
  { href: "/docs", label: "Docs", icon: ExternalLink },
];

export function TopCtaStrip() {
  return (
    <div className="sticky top-0 z-50 border-b border-white/10 bg-euphoria-panel2/95 px-4 py-2 text-white shadow-panel backdrop-blur">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-center gap-3 text-sm">
        <span className="font-semibold text-white/90">EuphoriaLens</span>
        <span className="text-white/40">&bull;</span>
        <span className="font-semibold text-euphoria-pink">On-Chain Analysis</span>
        <span className="text-white/40">&bull;</span>
        <span className="flex items-center gap-1.5 text-white/70">
          created by 
          <a href={creatorXUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1 font-bold text-white hover:text-euphoria-pink transition">
            <img src="/brand/x-logo.webp" alt="X" className="h-3 w-3 opacity-70" />
            @moltovy
          </a>
        </span>
        <div className="ml-auto">
          <a
            href={tradeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 rounded-md border border-euphoria-magenta/50 bg-gradient-to-r from-euphoria-magenta/20 to-euphoria-purple/20 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.12em] text-white transition hover:opacity-80"
          >
            Trade on Euphoria
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
    </div>
  );
}

export function NavBar({ active }: { active: string }) {
  return (
    <header className="border-b border-white/10 bg-euphoria-bg/[0.82] px-4 py-4 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <Link href="/" className="flex items-center group">
          <span className="flex flex-col leading-none">
            <span className="text-xl font-black tracking-tight text-white transition group-hover:text-euphoria-pink">
              EuphoriaLens
            </span>
            <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-euphoria-muted">
              On-Chain Analysis
            </span>
          </span>
        </Link>

        <nav className="flex gap-1 overflow-x-auto pb-1 lg:pb-0">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = active === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "border-euphoria-pink/60 bg-euphoria-pink/[0.12] text-white shadow-glow"
                    : "border-white/10 bg-white/[0.03] text-euphoria-muted hover:border-euphoria-pink/35 hover:text-white"
                }`}
              >
                <Icon size={16} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </header>
  );
}

export function MethodologyFooter({
  asOfUtc = fallbackAsOfUtc,
  metadata,
}: {
  asOfUtc?: string;
  metadata?: PublicDashboardMetadata;
}) {
  const dataThrough = metadata?.analysisDataThrough ?? metadata?.maxTimestamp ?? metadata?.lastSeenAt;
  return (
    <footer className="border-t border-white/10 px-4 py-10">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.5fr_1fr] lg:items-start">
        <div>
          <div className="text-xs font-bold uppercase tracking-[0.18em] text-euphoria-muted">
            EuphoriaLens
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-euphoria-subtle">
            Independent analytics for Euphoria Mainnet activity, including official leaderboard display when available, public-safe on-chain volume, taps, trading accounts, Net PNL (Est.), and concentration.
          </p>
          <p className="mt-3 text-xs leading-5 text-euphoria-subtle/60">
            Dashboard feed refreshed: {formatDateTime(asOfUtc)}
            {dataThrough ? ` | On-chain data through: ${formatDateTime(dataThrough)}` : ""}. EuphoriaLens is an independent research dashboard. Not affiliated with, endorsed by, or sponsored by Euphoria Finance.
          </p>
        </div>
        <div className="flex flex-wrap gap-2 lg:justify-end">
          <a
            href={tradeUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-euphoria-pink/50 bg-euphoria-pink/[0.10] px-4 py-2 text-sm font-bold text-white transition hover:bg-euphoria-pink/18"
          >
            <CircleDollarSign size={16} />
            Trade on Euphoria
            <ExternalLink size={14} />
          </a>
          <a
            href={xUrl}
            target="_blank"
            rel="noreferrer"
            aria-label="Follow Euphoria on X"
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-white/[0.04] text-white transition hover:border-euphoria-pink/35"
          >
            <img src="/brand/x-logo.webp" alt="X" className="h-3.5 w-3.5" />
          </a>
          <a
            href={euphoriaUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-bold text-white transition hover:border-euphoria-pink/35"
          >
            Euphoria
            <ExternalLink size={14} />
          </a>
        </div>
      </div>
    </footer>
  );
}

export function PublicShell({ active, asOfUtc, metadata, children }: PublicShellProps) {
  return (
    <div className="min-h-screen bg-euphoria-bg text-euphoria-text font-sans">
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(circle_at_18%_0%,rgba(255,186,224,0.09),transparent_28%),radial-gradient(circle_at_82%_8%,rgba(252,141,244,0.07),transparent_30%),linear-gradient(135deg,rgba(12,12,12,0.99),rgba(18,18,18,0.96)_48%,rgba(12,12,12,0.99))]" />
      <div className="relative z-10">
        <TopCtaStrip />
        <NavBar active={active} />
        {children}
        <MethodologyFooter asOfUtc={asOfUtc} metadata={metadata} />
      </div>
    </div>
  );
}
