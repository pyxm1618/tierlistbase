import { expect, it } from "vitest";

import audit from "../../../docs/dragon-traveler/character-audit.json";
import { verifiedBanners } from "@/modules/dragon-traveler-tier-list/banners";
import { globalSnapshot } from "@/modules/dragon-traveler-tier-list/global-snapshot";
import { taiwanSnapshot } from "@/modules/dragon-traveler-tier-list/taiwan-snapshot";

it("accounts for every handoff record without claiming missing evidence passed", () => {
  const roster = [globalSnapshot, taiwanSnapshot].flatMap((snapshot) =>
    snapshot.luminaries.map((character) => `${snapshot.id}:${character.id}`),
  );
  const audited = audit.records.map((record) => `${record.server}:${record.id}`);
  expect(new Set(audited).size).toBe(audited.length);
  expect(audited.sort()).toEqual(roster.sort());
  expect(audit.totals.original).toBe(
    audit.totals.pass + audit.totals.deferred + audit.totals.reject + audit.totals.unreviewed,
  );
  expect(audit.records.filter((record) => record.state === "deferred")).toHaveLength(
    audit.totals.deferred,
  );
});

it("keeps official-banner recommendation targets inside the matching snapshot", () => {
  for (const banner of verifiedBanners) {
    const snapshot = banner.server === "global" ? globalSnapshot : taiwanSnapshot;
    for (const id of banner.characterIds) {
      expect(snapshot.luminaries.some((character) => character.id === id)).toBe(true);
    }
    expect(Date.parse(banner.endsAt)).toBeGreaterThan(Date.parse(banner.startsAt));
  }
});
