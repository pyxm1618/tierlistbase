import { describe, expect, it } from "vitest";

import { currentBannerAt } from "@/modules/dragon-traveler-tier-list/banners";

describe("Dragon Traveler current banner evidence", () => {
  it("uses the Global publisher's event window rather than the ranking publication date", () => {
    const start = Date.parse("2026-10-22T05:00:00-05:00");
    const end = Date.parse("2026-11-05T05:00:00-05:00");
    expect(currentBannerAt("global", start - 1)).toBeNull();
    expect(currentBannerAt("global", start)?.characterIds).toEqual(["arachne"]);
    expect(currentBannerAt("global", Date.parse("2026-10-28T12:00:00+08:00"))?.sourceUrl).toBe(
      "https://news.game-tree.com/jx/dtofficialnewsen/20261021/1237.html",
    );
    expect(currentBannerAt("global", end - 1)?.server).toBe("global");
    expect(currentBannerAt("global", end)).toBeNull();
  });

  it("only shows the Taiwan official pool inside its server-local event window", () => {
    const before = Date.parse("2026-10-15T04:59:59+08:00");
    const start = before + 1000;
    const end = Date.parse("2026-10-29T05:00:00+08:00");
    expect(currentBannerAt("taiwan", before)).toBeNull();
    expect(currentBannerAt("taiwan", start)?.sourceUrl).toBe(
      "https://news.game-beans.com/jx/sodNotice/20261014/8285.html",
    );
    expect(currentBannerAt("taiwan", end - 1)?.characterIds).toEqual(["hypnos", "artemis"]);
    expect(currentBannerAt("taiwan", end)).toBeNull();
    expect(currentBannerAt("taiwan", end + 1)).toBeNull();
    expect(currentBannerAt("taiwan", Date.parse("2027-01-01"))).toBeNull();
  });

  it("does not produce a recommendation without a valid current time", () => {
    expect(currentBannerAt("taiwan", Number.NaN)).toBeNull();
    expect(currentBannerAt("taiwan", Infinity)).toBeNull();
  });
});
