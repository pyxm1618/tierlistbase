import { describe, expect, it, vi } from "vitest";

/**
 * `readArchivedRatingChanges` serves only queries the artifact can answer completely, and otherwise
 * returns `null` so the caller runs the original SQL. Inside that envelope it mirrors the SQL query:
 * filters apply across every covered context, the union is ordered by `changedAt` descending, `limit`
 * is applied last, and a record shared by two collections is never duplicated.
 *
 * The production snapshot has no rating_changes rows, so this behaviour is pinned with a fixture.
 */
const { snapshot } = vi.hoisted(() => {
  const change = (id: string, changedAt: string, entityName: string) => ({
    id,
    entityName,
    entitySlug: entityName.toLowerCase(),
    previousTier: "B",
    newTier: "A",
    changeType: "up",
    reason: null,
    evidence: null,
    changedAt,
    contextLabel: "Dungeon",
    toVersion: "Beta",
    gameSlug: "wow-forever",
  });

  const role = (contextId: string, versionId: string, changes: unknown[]) => ({
    board: {
      game: { id: "g", name: "World of Warcraft", slug: "wow-forever" },
      version: { id: versionId, version: "Beta", build: null, levelCap: 30, status: "current" },
      activeContext: {
        id: contextId,
        slug: `context-${contextId}`,
        mode: "dungeon",
        role: contextId,
        levelCap: 30,
        label: "Dungeon",
      },
      availableModes: ["dungeon"],
      availableRoles: [contextId],
      availableLevels: [30],
      availableBuilds: [],
      tiers: [],
      hasData: true,
    },
    changes,
  });

  return {
    snapshot: {
      schemaVersion: 1,
      provenance: {
        gameSlug: "wow-forever",
        coverage: {
          changesLimit: 10,
          versions: [
            {
              versionId: "v-beta",
              version: "Beta",
              complete: true,
              roles: ["dps", "support", "tank"],
            },
            { versionId: "v-previous", version: "Previous", complete: false, roles: ["healer"] },
          ],
        },
      },
      roles: {
        dps: role("ctx-dps", "v-beta", [
          change("change-dps-1", "2026-10-16T02:00:00.000Z", "Arms Warrior"),
          change("change-dps-2", "2026-10-14T02:00:00.000Z", "Frost Mage"),
        ]),
        tank: role("ctx-tank", "v-beta", [
          change("change-tank-1", "2026-10-15T02:00:00.000Z", "Guardian Druid"),
          // Same row id as the DPS set: a record must never be counted twice.
          change("change-dps-2", "2026-10-14T02:00:00.000Z", "Frost Mage"),
        ]),
        healer: role("ctx-healer", "v-previous", [
          change("change-healer-1", "2026-10-13T02:00:00.000Z", "Holy Priest"),
        ]),
        // Exported context that genuinely has no recorded changes.
        support: role("ctx-support", "v-beta", []),
      },
    },
  };
});

vi.mock("../../../src/modules/meta-board/db/archived-snapshots/registry", () => ({
  archivedMetaBoardSnapshots: { "wow-forever": snapshot },
}));

const { readArchivedRatingChanges } =
  await import("../../../src/modules/meta-board/db/archived-snapshot");

describe("archived rating changes: covered queries", () => {
  it("aggregates every role of a version the artifact proves complete", () => {
    const changes = readArchivedRatingChanges("wow-forever", 10, { toVersionId: "v-beta" });
    expect(changes?.map((change) => change.id)).toEqual([
      "change-dps-1",
      "change-tank-1",
      "change-dps-2",
    ]);
  });

  it("orders the whole union by changedAt before applying the limit", () => {
    const changes = readArchivedRatingChanges("wow-forever", 2, { toVersionId: "v-beta" });
    expect(changes?.map((change) => change.id)).toEqual(["change-dps-1", "change-tank-1"]);
    expect(changes?.map((change) => change.changedAt)).toEqual([
      new Date("2026-10-16T02:00:00.000Z"),
      new Date("2026-10-15T02:00:00.000Z"),
    ]);
  });

  it("never duplicates a record shared by more than one collection", () => {
    const changes = readArchivedRatingChanges("wow-forever", 10, { toVersionId: "v-beta" });
    expect(new Set(changes?.map((change) => change.id)).size).toBe(changes?.length);
    expect(changes?.filter((change) => change.id === "change-dps-2")).toHaveLength(1);
  });

  it("narrows to a single exported context for the page's own query shape", () => {
    const changes = readArchivedRatingChanges("wow-forever", 10, {
      rankingContextId: "ctx-tank",
      toVersionId: "v-beta",
    });
    expect(changes?.map((change) => change.id)).toEqual(["change-tank-1", "change-dps-2"]);
  });

  it("returns an empty array only when the covered context genuinely has no rows", () => {
    expect(
      readArchivedRatingChanges("wow-forever", 10, {
        rankingContextId: "ctx-support",
        toVersionId: "v-beta",
      }),
    ).toEqual([]);
    // The same context under a version it was never exported for is not "empty", it is uncovered.
    expect(
      readArchivedRatingChanges("wow-forever", 10, {
        rankingContextId: "ctx-support",
        toVersionId: "v-previous",
      }),
    ).toBeNull();
  });
});

describe("archived rating changes: queries outside the coverage envelope fall back to SQL", () => {
  it("refuses a version whose contexts were not all exported", () => {
    expect(readArchivedRatingChanges("wow-forever", 10, { toVersionId: "v-previous" })).toBeNull();
  });

  it("refuses an unknown version instead of reporting it as empty", () => {
    expect(readArchivedRatingChanges("wow-forever", 10, { toVersionId: "v-unknown" })).toBeNull();
  });

  it("refuses an unknown context instead of reporting it as empty", () => {
    expect(
      readArchivedRatingChanges("wow-forever", 10, {
        rankingContextId: "ctx-unknown",
        toVersionId: "v-beta",
      }),
    ).toBeNull();
  });

  it("refuses a context without a version, which spans versions the artifact never captured", () => {
    expect(
      readArchivedRatingChanges("wow-forever", 10, { rankingContextId: "ctx-dps" }),
    ).toBeNull();
  });

  it("refuses an unfiltered query, which spans every version of the game", () => {
    expect(readArchivedRatingChanges("wow-forever", 10)).toBeNull();
  });

  it("refuses a limit wider than the exported window", () => {
    expect(readArchivedRatingChanges("wow-forever", 11, { toVersionId: "v-beta" })).toBeNull();
    expect(
      readArchivedRatingChanges("wow-forever", 11, {
        rankingContextId: "ctx-dps",
        toVersionId: "v-beta",
      }),
    ).toBeNull();
    expect(readArchivedRatingChanges("wow-forever", 10, { toVersionId: "v-beta" })).not.toBeNull();
  });

  it("refuses a non-positive limit", () => {
    expect(readArchivedRatingChanges("wow-forever", 0, { toVersionId: "v-beta" })).toBeNull();
    expect(readArchivedRatingChanges("wow-forever", -1, { toVersionId: "v-beta" })).toBeNull();
  });

  it("returns null for a game without a snapshot", () => {
    expect(readArchivedRatingChanges("genshin-impact", 10)).toBeNull();
  });
});
