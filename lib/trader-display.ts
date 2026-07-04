import type { TraderRecord } from "@/lib/types";

export function traderDisplayName(trader: TraderRecord) {
  return trader.displayName || trader.username || trader.shortAddress;
}

export function traderSecondaryLabel(trader: TraderRecord) {
  if (trader.displayName || trader.username) {
    return trader.username ? `@${trader.username}` : trader.shortAddress;
  }
  return trader.shortAddress;
}
