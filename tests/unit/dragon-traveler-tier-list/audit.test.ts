import { expect, it } from "vitest";
import { getRoster, researchLedger } from "@/modules/dragon-traveler-tier-list";
import { currentBannerAt, verifiedBanners } from "@/modules/dragon-traveler-tier-list/banners";

it("accounts for each restored identity with an explicit evidence state", () => {
  expect(new Set(researchLedger.map((record) => record.id)).size).toBe(researchLedger.length);
  for (const server of ["global", "taiwan"] as const)
    for (const character of getRoster(server))
      expect(researchLedger.some((record) => record.id === character.id)).toBe(true);
});

it("keeps evaluated banner targets inside their ranked roster without forcing wait-for-testing releases into rankings", () => {
  for (const banner of verifiedBanners) {
    if (banner.recommendation !== "Wait for Testing") {
      for (const id of banner.characterIds)
        expect(getRoster(banner.server).some((character) => character.id === id)).toBe(true);
    }
    expect(Date.parse(banner.endsAt)).toBeGreaterThan(Date.parse(banner.startsAt));
  }

  const erato = verifiedBanners.find(
    (banner) => banner.server === "taiwan" && banner.characterIds.includes("erato"),
  );
  expect(erato?.recommendation).toBe("Wait for Testing");
  expect(getRoster("taiwan").some((character) => character.id === "erato")).toBe(false);
});

it("uses the latest active Global summon when banners overlap", () => {
  const banner = currentBannerAt("global", Date.parse("2026-11-03T12:00:00-05:00"));
  expect(banner?.bannerName).toBe("Mythical Summon — Select SSR Ex Luminary");
  expect(banner?.characterIds).toContain("poseidon");
  expect(banner?.characterIds).toContain("loki");
});

it("uses the current Taiwan mythic summon before the Erato release boundary", () => {
  const banner = currentBannerAt("taiwan", Date.parse("2026-11-05T04:59:59+08:00"));
  expect(banner?.characterIds).toEqual(["loki", "prometheus", "hera", "ares"]);
  expect(banner?.sourceUrl).toBe("https://news.game-beans.com/jx/sodNotice/20261027/8301.html");
});

it("uses Erato as the current Taiwan priority from the official release boundary", () => {
  const banner = currentBannerAt("taiwan", Date.parse("2026-11-05T05:00:00+08:00"));
  expect(banner?.characterIds).toEqual(["erato"]);
  expect(banner?.recommendation).toBe("Wait for Testing");
  expect(banner?.sourceUrl).toBe("https://sod.game-beans.com/jx/sodNotice/20261104/8323.html");
});
