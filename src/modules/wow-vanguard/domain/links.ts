import { WOW_CLASSES } from "@/platform/games/wow-classes";
import { parseSeatId, VanguardError } from "./event";
export function wowClassFromQuery(value: unknown): (typeof WOW_CLASSES)[number] | null {
  return typeof value === "string" ? (WOW_CLASSES.find((name) => name === value) ?? null) : null;
}
export function vanguardSeatLink(seatId: string) {
  parseSeatId(seatId);
  return `/wow-forever/vanguard?seat=${encodeURIComponent(seatId)}`;
}
export function vanguardTierListLink(className: string) {
  const selected = wowClassFromQuery(className);
  if (!selected) throw new VanguardError("INVALID_INPUT", 400);
  return `/wow-forever/tier-list?class=${encodeURIComponent(selected)}`;
}
