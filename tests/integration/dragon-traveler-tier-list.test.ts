import { describe, expect, it } from "vitest";

import {
  dragonTravelerAccountDecisions,
  dragonTravelerChanges,
  dragonTravelerSources,
  dragonTravelerTeams,
  globalSnapshot,
  taiwanSnapshot,
} from "@/modules/dragon-traveler-tier-list";

const snapshots = {
  global: globalSnapshot,
  taiwan: taiwanSnapshot,
} as const;

describe("Dragon Traveler module integration", () => {
  it("keeps teams connected to real records in the matching server snapshot", () => {
    for (const team of dragonTravelerTeams) {
      const names = new Set(snapshots[team.server].luminaries.map((luminary) => luminary.name));
      expect(team.members).toHaveLength(6);
      for (const member of team.members) expect(names.has(member), member).toBe(true);
    }
  });

  it("keeps the frozen account-decision surface complete for each server", () => {
    for (const server of ["global", "taiwan"] as const) {
      expect(
        dragonTravelerAccountDecisions
          .filter((decision) => decision.server === server)
          .map((decision) => decision.type)
          .sort(),
      ).toEqual(["pull", "reroll", "wishlist"]);
    }
  });

  it("has server-relevant change evidence and source coverage", () => {
    for (const server of ["global", "taiwan"] as const) {
      expect(dragonTravelerChanges.some((change) => change.server === server)).toBe(true);
      expect(
        dragonTravelerSources.some(
          (source) => source.server === server || source.server === "both",
        ),
      ).toBe(true);
    }
  });
});
