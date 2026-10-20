import { describe, expect, it } from "vitest";
import { identityRows, egoRows, mapAvailability } from "@/modules/limbus-tier-list/data";
import {
  identitiesMasterData,
  egoMasterData,
  sinnerBestIdentities,
  sinnerBestEgo,
  teamsMasterData,
} from "@/modules/limbus-tier-list/data/index";
import type { AvailabilityFact } from "@/modules/limbus-tier-list/data/types";

const slots = ["bestOverall", "bestGeneralist", "bestForTeam"] as const;
const identityReferences = identitiesMasterData.map(({ fact }) => ({
  name: fact.identityName,
  sinner: fact.sinner,
}));
const egoReferences = egoMasterData.map(({ fact }) => ({
  name: fact.egoName,
  sinner: fact.sinner,
}));

function resolve(name: string, records: typeof identityReferences) {
  const matches = records.filter((record) => record.name === name);
  expect(matches, `Reference must resolve exactly once: ${name}`).toHaveLength(1);
  const record = matches[0]!;
  expect(name.endsWith(` ${record.sinner}`), `Reference owner: ${name}`).toBe(true);
  return record;
}

describe("Limbus recommendation integrity", () => {
  for (const [kind, picks, records] of [
    ["Identity", sinnerBestIdentities, identityReferences],
    ["E.G.O", sinnerBestEgo, egoReferences],
  ] as const) {
    for (const pick of picks)
      for (const slot of slots) {
        it(`${kind} ${pick.sinner}.${slot} resolves to the correct Sinner`, () => {
          expect(resolve(pick[slot].name, records).sinner).toBe(pick.sinner);
        });
      }
  }
  for (const team of teamsMasterData) {
    for (const field of ["coreMembers", "recommendedTeam", "substitutes", "keyEgo"] as const) {
      it(`${team.id}.${field} contains only exact master references`, () => {
        for (const name of team[field])
          resolve(name, field === "keyEgo" ? egoReferences : identityReferences);
      });
    }
    it(`${team.id} fields six distinct Sinners`, () => {
      const sinners = team.recommendedTeam.map((name) => resolve(name, identityReferences).sinner);
      expect(sinners).toHaveLength(6);
      expect(new Set(sinners).size).toBe(sinners.length);
    });
  }
});

it("Heishou core members belong to the master-defined faction", () => {
  const team = teamsMasterData.find((team) => team.id === "faction-heishou")!;
  for (const name of team.coreMembers) {
    const identity = identitiesMasterData.find(({ fact }) => fact.identityName === name)!;
    expect(identity.fact.factions, name).toContain("Heishou Pack");
  }
});

it("Ryōshū best-overall E.G.O follows the existing master ranking", () => {
  const pick = sinnerBestEgo.find((pick) => pick.sinner === "Ryōshū")!;
  const order = ["SSS", "SS", "S", "A", "B", "C", "NEEDS_REVIEW"];
  const options = egoMasterData.filter(({ fact }) => fact.sinner === pick.sinner);
  const selected = options.find(({ fact }) => fact.egoName === pick.bestOverall.name)!;
  expect(order.indexOf(selected.editorial.tier)).toBe(
    Math.min(...options.map(({ editorial }) => order.indexOf(editorial.tier))),
  );
});

describe("Limbus acquisition availability", () => {
  it("shows default-unlocked master assets as available", () => {
    for (const [records, rows] of [
      [identitiesMasterData, identityRows],
      [egoMasterData, egoRows],
    ] as const) {
      const starters = records.filter(({ fact }) =>
        fact.availability.acquisitionNote?.includes("unlocked by default"),
      );
      expect(starters).toHaveLength(12);
      for (const { fact } of starters) {
        const name = "identityName" in fact ? fact.identityName : fact.egoName;
        const row = rows.find((row) => ("identity" in row ? row.identity : row.ego) === name);
        expect(row?.availability, name).toBe("Available");
      }
    }
  });
  const baseline: AvailabilityFact = {
    extractableNow: false,
    dispensableNow: false,
    isWalpurgisnacht: false,
    temporarilyUnavailable: false,
    acquisitionNote: null,
  };
  it.each([
    [{ extractableNow: true, dispensableNow: true }, "Standard Fare", null, "Available"],
    [{ extractableNow: true }, "Seasonal", 8, "Extractable"],
    [{ dispensableNow: true }, "Pass", 7, "Shardable"],
    [{ isWalpurgisnacht: true }, "Walpurgisnacht", null, "Walpurgisnacht"],
    [{}, "Pass", 8, "Pass"],
    [{ temporarilyUnavailable: true }, "Event", 7, "Temporarily Unavailable"],
    [{}, "Event", null, "Unavailable"],
    [{ extractableNow: null, dispensableNow: null }, "Standard Fare", null, "Unavailable"],
  ] as const)("preserves existing acquisition state %j", (overrides, context, season, expected) => {
    expect(mapAvailability({ ...baseline, ...overrides }, context, season)).toBe(expected);
  });
});
