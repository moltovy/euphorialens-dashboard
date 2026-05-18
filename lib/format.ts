export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function shortAddress(address: string) {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function formatInteger(value: number) {
  return new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 }).format(value);
}

export function formatUsd(valueUsd: number, options: { signed?: boolean; compact?: boolean } = {}) {
  const { signed = false, compact = false } = options;
  const abs = Math.abs(valueUsd);
  const formatted = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    notation: compact ? "compact" : "standard",
    maximumFractionDigits: compact ? 2 : 0,
  }).format(abs);

  if (valueUsd < 0) return `-${formatted}`;
  if (signed && valueUsd > 0) return `+${formatted}`;
  return formatted;
}

export function formatOptionalUsd(
  valueUsd: number | null | undefined,
  options: { signed?: boolean; compact?: boolean } = {},
) {
  if (typeof valueUsd !== "number" || !Number.isFinite(valueUsd)) return "—";
  return formatUsd(valueUsd, options);
}

export function formatPercent(value: number, fractionDigits = 1) {
  return `${new Intl.NumberFormat("en-US", {
    maximumFractionDigits: fractionDigits,
    minimumFractionDigits: fractionDigits,
  }).format(value)}%`;
}

export function formatOptionalPercent(value: number | null | undefined, fractionDigits = 1) {
  if (typeof value !== "number" || !Number.isFinite(value)) return "—";
  return formatPercent(value, fractionDigits);
}

export function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${date}T00:00:00Z`));
}

export function formatDateTime(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "UTC",
    timeZoneName: "short",
  }).format(new Date(date));
}
