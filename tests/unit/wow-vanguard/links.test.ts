import { expect, it } from "vitest";
import { vanguardSeatLink, vanguardTierListLink, wowClassFromQuery } from "@/modules/wow-vanguard";
it("shares only the immutable Seat ID", () =>
  expect(vanguardSeatLink("FOREVER-E2-0421")).toBe("/wow-forever/vanguard?seat=FOREVER-E2-0421"));
it("builds the existing class Tier List URL from WOW_CLASSES", () => {
  expect(vanguardTierListLink("Warrior")).toBe("/wow-forever/tier-list?class=Warrior");
  expect(() => vanguardTierListLink("not a class")).toThrow();
  expect(wowClassFromQuery("Warrior")).toBe("Warrior");
  expect(wowClassFromQuery("email@example.com")).toBeNull();
});
