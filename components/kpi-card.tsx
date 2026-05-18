import type { ReactNode } from "react";

type KpiCardProps = {
  label: string;
  value: string;
  detail?: string;
  icon?: import("react").ReactNode;
  tone?: "pink" | "cyan" | "purple" | "green" | "red" | "neutral";
};

const toneClasses = {
  pink: "text-euphoria-pink border-euphoria-pink/30 bg-euphoria-pink/[0.06]",
  cyan: "text-white border-white/20 bg-white/[0.03]",
  purple: "text-euphoria-magenta border-euphoria-magenta/30 bg-euphoria-magenta/[0.06]",
  green: "text-euphoria-green border-euphoria-green/30 bg-euphoria-green/[0.06]",
  red: "text-euphoria-red border-euphoria-red/30 bg-euphoria-red/[0.06]",
  neutral: "text-white border-white/10 bg-white/[0.02]",
};

const stickerByLabel: Record<string, string> = {
  "Active Days": "/brand/stickers/20.webp",
  "Active Traders": "/brand/stickers/12.webp",
  "Indexed Traders": "/brand/stickers/3.webp",
  "Largest Bet": "/brand/stickers/11.webp",
  "Largest Payout": "/brand/stickers/11.webp",
  "Largest Platform Payout": "/brand/stickers/19.webp",
  "Net PNL (Est.)": "/brand/stickers/7.webp",
  "Platform Win Rate": "/brand/stickers/4.webp",
  "PnL (Estimated)": "/brand/stickers/7.webp",
  "Recent active": "/brand/stickers/13.webp",
  "Top 10 share": "/brand/stickers/14.webp",
  "Top Leaderboard Score": "/brand/stickers/19.webp",
  "Top Net PNL (Est.)": "/brand/stickers/7.webp",
  "Top PnL (Estimated)": "/brand/stickers/7.webp",
  "Total PnL (Estimated)": "/brand/stickers/7.webp",
  "Total Payouts": "/brand/stickers/19.webp",
  "Total Taps": "/brand/stickers/15.webp",
  "Top wallets": "/brand/stickers/6.webp",
  "Trading Accounts": "/brand/stickers/3.webp",
  "Trader records": "/brand/stickers/5.webp",
  Volume: "/brand/stickers/1.webp",
  "On-chain Volume": "/brand/stickers/1.webp",
};

const fallbackStickers = [
  "/brand/stickers/1.webp",
  "/brand/stickers/3.webp",
  "/brand/stickers/4.webp",
  "/brand/stickers/5.webp",
  "/brand/stickers/6.webp",
  "/brand/stickers/7.webp",
  "/brand/stickers/8.webp",
  "/brand/stickers/10.webp",
  "/brand/stickers/11.webp",
  "/brand/stickers/12.webp",
  "/brand/stickers/13.webp",
  "/brand/stickers/14.webp",
  "/brand/stickers/15.webp",
  "/brand/stickers/16.webp",
  "/brand/stickers/17.webp",
  "/brand/stickers/19.webp",
  "/brand/stickers/20.webp",
  "/brand/stickers/21.webp",
] as const;

function stickerForLabel(label: string): string {
  const mapped = stickerByLabel[label];
  if (mapped) {
    return mapped;
  }
  const hash = Array.from(label).reduce((total, char) => total + char.charCodeAt(0), 0);
  return fallbackStickers[hash % fallbackStickers.length];
}

function DefaultSticker({ label }: { label: string }) {
  return (
    <img
      src={stickerForLabel(label)}
      alt="Euphoria goat sticker"
      className="h-11 w-11 object-contain drop-shadow-[0_0_10px_rgba(252,141,244,0.28)]"
      loading="lazy"
    />
  );
}

export function KpiCard({ label, value, detail, icon, tone = "neutral" }: KpiCardProps) {
  const accent = icon ?? <DefaultSticker label={label} />;

  return (
    <article className="rounded-lg border border-white/10 bg-euphoria-panel/[0.86] p-4 shadow-panel backdrop-blur transition hover:border-white/20">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-xs font-bold uppercase tracking-[0.14em] text-euphoria-muted">{label}</div>
          <div className="mt-3 truncate text-2xl font-black text-white font-mono">{value}</div>
        </div>
        <div className="shrink-0 flex h-12 w-12 items-center justify-center -mr-2 -mt-2">{accent}</div>
      </div>
      {detail ? <p className="mt-4 text-sm leading-5 text-euphoria-subtle">{detail}</p> : null}
    </article>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-5">
      <div className="text-xs font-bold uppercase tracking-[0.18em] text-euphoria-pink">{eyebrow}</div>
      <h2 className="mt-2 text-2xl font-black text-white md:text-3xl">{title}</h2>
      {description ? <p className="mt-2 max-w-3xl text-sm leading-6 text-euphoria-muted">{description}</p> : null}
    </div>
  );
}

export function CohortBadge({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-md border border-euphoria-pink/30 bg-euphoria-pink/10 px-2.5 py-1 text-xs font-bold uppercase tracking-[0.08em] text-euphoria-pink">
      {children}
    </span>
  );
}
