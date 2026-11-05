import { describe, expect, it } from "vitest";

import {
  currentBannerAt,
  verifiedBanners,
} from "@/modules/dragon-traveler-tier-list/banners";

const globalMythicName = "Mythical Summon — Select SSR Ex Luminary";
const taiwanFirstPool = ["hypnos", "artemis"];
const taiwanSecondPool = ["loki", "prometheus", "hera", "ares"];
const eratoPool = ["erato"];

describe("Dragon Traveler current banner evidence", () => {
  it("tracks Global banner handoffs", () => {
    const arachneStart = Date.parse("2026-10-22T05:00:00-05:00");
    const mythicStart = Date.parse("2026-10-29T05:00:00-05:00");
    const mythicEnd = Date.parse("2026-11-12T05:00:00-05:00");
    const beforeMythic = mythicStart - 1;

    expect(currentBannerAt("global", arachneStart - 1)).toBeNull();
    expect(currentBannerAt("global", arachneStart)?.characterIds).toEqual(["arachne"]);
    expect(currentBannerAt("global", beforeMythic)?.characterIds).toEqual(["arachne"]);
    expect(currentBannerAt("global", mythicStart)?.bannerName).toBe(globalMythicName);
    expect(currentBannerAt("global", mythicEnd - 1)?.server).toBe("global");
    expect(currentBannerAt("global", mythicEnd)).toBeNull();
  });

  it("tracks Taiwan Erato handoff while the older mythic summon remains active in parallel", () => {
    const beforeFirst = Date.parse("2026-10-15T04:59:59+08:00");
    const firstStart = beforeFirst + 1000;
    const secondStart = Date.parse("2026-10-29T05:00:00+08:00");
    const eratoStart = Date.parse("2026-11-05T05:00:00+08:00");
    const secondEnd = Date.parse("2026-11-12T05:00:00+08:00");
    const eratoEnd = Date.parse("2026-11-19T05:00:00+08:00");

    expect(currentBannerAt("taiwan", beforeFirst)).toBeNull();
    expect(currentBannerAt("taiwan", firstStart)?.characterIds).toEqual(taiwanFirstPool);
    expect(currentBannerAt("taiwan", secondStart - 1)?.characterIds).toEqual(taiwanFirstPool);
    expect(currentBannerAt("taiwan", secondStart)?.characterIds).toEqual(taiwanSecondPool);

    expect(currentBannerAt("taiwan", eratoStart - 1)?.characterIds).toEqual(taiwanSecondPool);

    const parallelAtEratoStart = verifiedBanners.filter(
      (banner) =>
        banner.server === "taiwan" &&
        eratoStart >= Date.parse(banner.startsAt) &&
        eratoStart < Date.parse(banner.endsAt),
    );
    expect(parallelAtEratoStart.map((banner) => banner.characterIds)).toEqual(
      expect.arrayContaining([taiwanSecondPool, eratoPool]),
    );

    expect(currentBannerAt("taiwan", eratoStart)?.characterIds).toEqual(eratoPool);
    expect(currentBannerAt("taiwan", eratoStart)?.recommendation).toBe("Wait for Testing");
    expect(currentBannerAt("taiwan", secondEnd - 1)?.characterIds).toEqual(eratoPool);
    expect(currentBannerAt("taiwan", secondEnd)?.characterIds).toEqual(eratoPool);
    expect(currentBannerAt("taiwan", eratoEnd - 1)?.characterIds).toEqual(eratoPool);
    expect(currentBannerAt("taiwan", eratoEnd)).toBeNull();
    expect(currentBannerAt("taiwan", Date.parse("2027-01-01"))).toBeNull();
  });

  it("rejects invalid current times", () => {
    expect(currentBannerAt("taiwan", Number.NaN)).toBeNull();
    expect(currentBannerAt("taiwan", Infinity)).toBeNull();
  });
});
