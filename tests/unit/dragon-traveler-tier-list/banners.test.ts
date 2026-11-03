import { describe, expect, it } from "vitest";

import { currentBannerAt } from "@/modules/dragon-traveler-tier-list/banners";

describe("Dragon Traveler current banner evidence", () => {
  it("uses the newest active Global publisher window when banners overlap", () => {
    const arachneStart = Date.parse("2026-10-22T05:00:00-05:00");
    const mythicStart = Date.parse("2026-10-29T05:00:00-05:00");
    const mythicEnd = Date.parse("2026-11-12T05:00:00-05:00");

    expect(currentBannerAt("global", arachneStart - 1)).toBeNull();
    expect(currentBannerAt("global", arachneStart)?.characterIds).toEqual(["arachne"]);
    expect(currentBannerAt("global", Date.parse("2026-10-28T12:00:00+08:00"))?.sourceUrl).toBe(
      "https://news.game-tree.com/jx/dtofficialnewsen/20261021/1237.html",
    );
    expect(currentBannerAt("global", mythicStart - 1)?.characterIds).toEqual(["arachne"]);
    expect(currentBannerAt("global", mythicStart)?.bannerName).toBe(
      "Mythical Summon — Select SSR Ex Luminary",
    );
    expect(currentBannerAt("global", mythicEnd - 1)?.server).toBe("global");
    expect(currentBannerAt("global", mythicEnd)).toBeNull();
  });

  it(
    "moves directly between consecutive Taiwan official pools at the server-local boundary",
    () => {
      const before = Date.parse("2026-10-15T04:59:59+08:00");
      const firstStart = before + 1000;
      const secondStart = Date.parse("2026-10-29T05:00:00+08:00");
      const secondEnd = Date.parse("2026-11-12T05:00:00+08:00");

      expect(currentBannerAt("taiwan", before)).toBeNull();
      expect(currentBannerAt("taiwan", firstStart)?.sourceUrl).toBe(
        "https://news.game-beans.com/jx/sodNotice/20261014/8285.html",
      );
      expect(currentBannerAt("taiwan", secondStart - 1)?.characterIds).toEqual(["hypnos", "artemis"]);
      expect(currentBannerAt("taiwan", secondStart)?.characterIds).toEqual([
        "loki",
        "prometheus",
        "hera",
        "ares",
      ]);
      expect(currentBannerAt("taiwan", secondEnd - 1)?.server).toBe("taiwan");
      expect(currentBannerAt("taiwan", secondEnd)).toBeNull();
      expect(currentBannerAt("taiwan", Date.parse("2027-01-01"))).toBeNull();
    },
  );

  it("does not produce a recommendation without a valid current time", () => {
    expect(currentBannerAt("taiwan", Number.NaN)).toBeNull();
    expect(currentBannerAt("taiwan", Infinity)).toBeNull();
  });
});
