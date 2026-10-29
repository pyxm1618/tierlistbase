import { expect, it } from "vitest";
import { getRoster, researchLedger } from "@/modules/dragon-traveler-tier-list";
import { verifiedBanners } from "@/modules/dragon-traveler-tier-list/banners";
it("accounts for each restored identity with an explicit evidence state", () => {
  expect(new Set(researchLedger.map((record) => record.id)).size).toBe(researchLedger.length);
  for (const server of ["global", "taiwan"] as const)
    for (const character of getRoster(server))
      expect(researchLedger.some((record) => record.id === character.id)).toBe(true);
});
it("keeps official-banner targets inside their matching live roster", () => {
  for (const banner of verifiedBanners) {
    for (const id of banner.characterIds)
      expect(getRoster(banner.server).some((character) => character.id === id)).toBe(true);
    expect(Date.parse(banner.endsAt)).toBeGreaterThan(Date.parse(banner.startsAt));
  }
});
