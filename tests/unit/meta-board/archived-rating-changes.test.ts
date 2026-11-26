import { describe, expect, it, vi } from "vitest";

/**
 * `readArchivedRatingChanges` must mirror the SQL query exactly: filters apply across every archived
 * ranking context, the union is ordered by `changedAt` descending, and `limit` is applied last.
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
      provenance: { gameSlug: "wow-forever" },
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
      },
    },
  };
});

vi.mock("../../../src/modules/meta-board/db/archived-snapshots/registry", () => ({
  archivedMetaBoardSnapshots: { "wow-forever": snapshot },
}));

const { readArchivedRatingChanges } =
  await import("../../../src/modules/meta-board/db/archived-snapshot");

describe("archived rating changes match the SQL query semantics", () => {
  it("aggregates every role that shares the requested version", () => {
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

  it("narrows to a single ranking context when one is requested", () => {
    const changes = readArchivedRatingChanges("wow-forever", 10, {
      rankingContextId: "ctx-tank",
      toVersionId: "v-beta",
    });
    expect(changes?.map((change) => change.id)).toEqual(["change-tank-1", "change-dps-2"]);
  });

  it("returns an empty list, not the first match, when nothing matches", () => {
    expect(readArchivedRatingChanges("wow-forever", 10, { toVersionId: "v-unknown" })).toEqual([]);
    expect(
      readArchivedRatingChanges("wow-forever", 10, { rankingContextId: "ctx-unknown" }),
    ).toEqual([]);
  });

  it("unions every archived role when no filter is supplied", () => {
    const changes = readArchivedRatingChanges("wow-forever", 10);
    expect(changes?.map((change) => change.id)).toEqual([
      "change-dps-1",
      "change-tank-1",
      "change-dps-2",
      "change-healer-1",
    ]);
  });

  it("returns null for a game without a snapshot so the caller falls back to SQL", () => {
    expect(readArchivedRatingChanges("genshin-impact", 10)).toBeNull();
  });
});
