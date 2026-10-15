import { describe, expect, it } from "vitest";
import {
  parseDungeonEvidence,
  buildWowSpecs,
  summarizeWowStatus,
} from "@/modules/meta-board/wow/model";
import type { BoardEntityItem, MetaBoardData } from "@/modules/meta-board/db/queries";

const notes = JSON.stringify({
  derivedBy: "TierListBase",
  dataSource: "Forever Logs Public API",
  attributionUrl: "https://foreverlogs.gg/",
  retrievedAt: "2026-10-15T00:00:00Z",
  dungeons: [
    {
      location: "Uldaman",
      median: 150,
      sampleSize: 12,
      included: true,
      normalizedScore: 110,
      flags: [],
    },
    {
      location: "Razorfen Downs",
      median: 100,
      sampleSize: 10,
      included: true,
      normalizedScore: 100,
      flags: [],
    },
  ],
});
const item = {
  entityId: "mage",
  entityName: "Fire Mage",
  entitySlug: "fire-mage",
  entityType: "spec",
  role: "dps",
  tier: "A",
  consensusScore: 105.45,
  freshnessStatus: "current",
  profile: { className: "Mage", specName: "Fire" },
  sources: [
    {
      sourceId: "logs",
      sourceType: "data",
      sourceUrl: "https://foreverlogs.gg/",
      versionMatch: true,
      notes,
      sampleSize: 22,
      rawRank: 1,
      normalizedScore: 105.45,
      checkedAt: new Date("2026-10-15T00:00:00Z"),
    },
  ],
} as unknown as BoardEntityItem;
const board = {
  version: { id: "v1", version: "Current Beta", status: "current", levelCap: 30 },
  activeContext: { id: "dps", role: "dps", mode: "dungeon", levelCap: 30 },
  tiers: [{ tier: "A", items: [item] }],
  hasData: true,
} as MetaBoardData;
describe("WoW stored performance presentation", () => {
  it("reads real dungeon samples and coverage without converting score to DPS", () => {
    const result = buildWowSpecs(board)[0]!;
    expect(result).toMatchObject({
      className: "Mage",
      specName: "Fire",
      score: 105.45,
      parses: 22,
      coverage: 2,
      rank: 1,
    });
    expect(result.dungeons[0]).toMatchObject({ location: "Uldaman", median: 150 });
  });
  it("rejects malformed, duplicate or foreign dungeon evidence as a whole", () => {
    for (const value of [
      "{",
      JSON.stringify({ dungeons: [] }),
      notes.replace('"Uldaman"', '"Molten Core"'),
      notes.replace('"Razorfen Downs"', '"Uldaman"'),
      notes.replace('"sampleSize":12', '"sampleSize":-1'),
    ])
      expect(parseDungeonEvidence(value)).toBeNull();
  });
  it("does not accept mismatched context/version or samples below requirements", () => {
    expect(
      buildWowSpecs({ ...board, activeContext: { ...board.activeContext!, role: "tank" } })[0]
        ?.score,
    ).toBeNull();
    expect(
      buildWowSpecs({
        ...board,
        tiers: [
          {
            tier: "A",
            items: [{ ...item, sources: item.sources.map((s) => ({ ...s, versionMatch: false })) }],
          },
        ],
      })[0]?.score,
    ).toBeNull();
    const short = {
      ...item,
      sources: item.sources.map((s) => ({
        ...s,
        notes: notes
          .replace('"sampleSize":12', '"sampleSize":5')
          .replace('"sampleSize":10', '"sampleSize":5'),
      })),
    };
    expect(buildWowSpecs({ ...board, tiers: [{ tier: "A", items: [short] }] })[0]).toMatchObject({
      tier: "Pending",
      rank: null,
      score: null,
    });
  });
  it("preserves unknown class identity rather than parsing names", () => {
    expect(
      buildWowSpecs({
        ...board,
        tiers: [{ tier: "A", items: [{ ...item, profile: undefined }] }],
      })[0]?.className,
    ).toBeNull();
  });
  it("never marks a legacy version Current without phase provenance", () => {
    expect(summarizeWowStatus(board, new Date("2026-10-15T01:00:00Z"))).toBe("Preliminary");
    expect(
      summarizeWowStatus(
        { ...board, version: { ...board.version!, status: "stale" } },
        new Date("2026-10-15T01:00:00Z"),
      ),
    ).toBe("Stale");
  });
  it("strictly filters out cohort entities from WoW spec tier board", () => {
    const cohortItem = {
      ...item,
      entityId: "gladiator",
      entityName: "Gladiator Warrior",
      entitySlug: "gladiator-warrior",
      entityType: "cohort",
      profile: { className: "Warrior", specName: "Gladiator" },
    } as unknown as BoardEntityItem;
    const boardWithCohort = {
      ...board,
      tiers: [{ tier: "A", items: [item, cohortItem] }],
    } as MetaBoardData;
    const specs = buildWowSpecs(boardWithCohort);
    expect(specs.some((s) => s.specName === "Gladiator")).toBe(false);
    expect(specs.some((s) => s.specName === "Fire")).toBe(true);
  });
});

it("rejects stored tier/score conflict rather than publishing an inconsistent tier", () => {
  expect(
    buildWowSpecs({ ...board, tiers: [{ tier: "S", items: [{ ...item, tier: "S" }] }] })[0],
  ).toMatchObject({ tier: "Pending", score: null, rank: null });
});
it("requires a complete, matching reviewed version and source check before Current", () => {
  const checkedAt = "2026-10-15T00:00:00Z";
  const review = {
    phaseId: 1,
    phaseName: "Current Beta",
    levelCap: 30,
    checkedAt,
    officialSourceUrl:
      "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes/2360696",
    taxonomySourceUrl: "https://foreverlogs.gg/faq",
    dungeons: ["City of Dalaran", "Excavation Site: Wetlands", "Razorfen Downs", "Uldaman"],
    roleBySpec: { "Mage::Fire": ["dps"] },
  };
  const currentItem = {
    ...item,
    dataStatus: "available",
    sources: item.sources.map((s) => ({
      ...s,
      sourceFreshness: "current",
      notes: JSON.stringify({
        ...JSON.parse(notes),
        phaseId: 1,
        phaseName: "Current Beta",
        publicationVerifiedAt: checkedAt,
      }),
    })),
  };
  const current = {
    ...board,
    version: { ...board.version!, version: "Stored Beta Old", notes: JSON.stringify(review) },
    tiers: [{ tier: "A", items: [currentItem] }],
  };
  const now = new Date("2026-10-15T01:00:00Z");
  expect(
    summarizeWowStatus(
      { ...current, version: { ...current.version, version: "Current Beta" } },
      now,
    ),
  ).toBe("Current");
  expect(summarizeWowStatus(current, now)).toBe("Preliminary");
  expect(
    summarizeWowStatus(
      {
        ...current,
        version: {
          ...current.version,
          version: "Current Beta",
          notes: JSON.stringify({ phaseId: 1 }),
        },
      },
      now,
    ),
  ).toBe("Preliminary");
  expect(
    summarizeWowStatus(
      {
        ...current,
        version: { ...current.version, version: "Current Beta" },
        tiers: [
          {
            tier: "A",
            items: [
              {
                ...currentItem,
                sources: currentItem.sources.map((s) => ({ ...s, sourceFreshness: "stale" })),
              },
            ],
          },
        ],
      },
      now,
    ),
  ).toBe("Stale");
});
