import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import wowForeverSnapshot from "../../../src/modules/meta-board/db/archived-snapshots/wow-forever.json";
import {
  readArchivedMetaBoard,
  readArchivedRatingChanges,
} from "../../../src/modules/meta-board/db/archived-snapshot";
import type { ArchivedMetaBoardSnapshot } from "../../../src/modules/meta-board/db/archived-snapshot";

const snapshot = wowForeverSnapshot as unknown as ArchivedMetaBoardSnapshot;

describe("WoW archived ranking snapshot", () => {
  it("covers every archived role with real tiers and evidence", () => {
    expect(Object.keys(snapshot.roles).sort()).toEqual(["dps", "healer", "tank"]);

    for (const [role, roleSnapshot] of Object.entries(snapshot.roles)) {
      const items = roleSnapshot.board.tiers.flatMap((group) => group.items);
      expect(items.length, `${role} items`).toBeGreaterThan(0);
      expect(roleSnapshot.board.hasData, `${role} hasData`).toBe(true);
      expect(roleSnapshot.board.activeContext?.role, `${role} context role`).toBe(role);
      expect(roleSnapshot.board.version?.levelCap, `${role} level cap`).toBe(30);

      for (const item of items) {
        expect(item.entityId, `${role} entity id`).toBeTruthy();
        expect(item.tier, `${role} tier`).toBeTruthy();
        expect(item.sources.length, `${role}/${item.entityName} evidence`).toBeGreaterThan(0);
        expect(Number.isNaN(new Date(item.lastUpdated).getTime())).toBe(false);
      }
    }
  });

  it("records the real export counts so a reviewer can audit the artifact", () => {
    const items = Object.values(snapshot.roles).flatMap((role) =>
      role.board.tiers.flatMap((group) => group.items),
    );
    expect(snapshot.provenance.counts.entities).toBe(items.length);
    expect(snapshot.provenance.counts.evidenceSources).toBe(
      items.reduce((total, item) => total + item.sources.length, 0),
    );
    expect(snapshot.provenance.counts.ratingChanges).toBe(
      Object.values(snapshot.roles).reduce((total, role) => total + role.changes.length, 0),
    );
    expect(snapshot.provenance.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
  });

  it("serves a role with revived timestamps and keeps the archived Beta framing", () => {
    const board = readArchivedMetaBoard({ gameSlug: "wow-forever", mode: "dungeon", role: "dps" });
    expect(board).not.toBeNull();
    expect(board?.version?.version).toBe("Beta");
    expect(board?.activeContext?.slug).toBe("dungeon-dps-30");

    const firstItem = board?.tiers[0]?.items[0];
    expect(firstItem?.lastUpdated).toBeInstanceOf(Date);
    expect(firstItem?.sources[0]?.checkedAt).toBeInstanceOf(Date);
  });

  it("degrades an unknown role exactly like the SQL path instead of inventing data", () => {
    const board = readArchivedMetaBoard({ gameSlug: "wow-forever", role: "support" });
    expect(board?.hasData).toBe(false);
    expect(board?.tiers).toEqual([]);
    expect(board?.activeContext).toBeNull();
    expect(board?.availableRoles).toEqual(["dps", "healer", "tank"]);
  });

  it("falls back to the database for a query the snapshot does not cover", () => {
    expect(
      readArchivedMetaBoard({ gameSlug: "wow-forever", role: "dps", mode: "leveling" }),
    ).toBeNull();
    expect(
      readArchivedMetaBoard({ gameSlug: "wow-forever", role: "dps", levelCap: 60 }),
    ).toBeNull();
    expect(
      readArchivedMetaBoard({ gameSlug: "wow-forever", role: "dps", build: "12345" }),
    ).toBeNull();
    expect(readArchivedMetaBoard({ gameSlug: "genshin-impact", role: "dps" })).toBeNull();
  });

  it("serves the page's own query without opening a database read", async () => {
    const databaseAccess = vi.fn(() => {
      throw new Error("the archived read path must not touch the database");
    });
    vi.doMock("@/platform/database/application-database", () => ({
      get db() {
        return databaseAccess();
      },
      runWithRequestDatabase: databaseAccess,
    }));

    const { getGameMetaBoardData, getRecentRatingChanges } =
      await import("../../../src/modules/meta-board/db/queries");
    const board = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "dungeon",
      role: "dps",
      levelCap: 30,
    });
    const changes = await getRecentRatingChanges("wow-forever", 10, undefined, {
      rankingContextId: board.activeContext!.id,
      toVersionId: board.version!.id,
    });

    expect(board.hasData).toBe(true);
    expect(board.activeContext?.role).toBe("dps");
    expect(changes).toHaveLength(snapshot.roles.dps!.changes.length);
    expect(databaseAccess).not.toHaveBeenCalled();
    vi.doUnmock("@/platform/database/application-database");
  });

  it("still reads the database when a caller passes an explicit handle", async () => {
    const select = vi.fn(() => {
      throw new Error("explicit database handle used");
    });
    const { getGameMetaBoardData } = await import("../../../src/modules/meta-board/db/queries");
    await expect(
      getGameMetaBoardData({ gameSlug: "wow-forever", role: "dps", db: { select } as never }),
    ).rejects.toThrow("explicit database handle used");
    expect(select).toHaveBeenCalled();
  });

  it("serves the page's own change query from the snapshot", () => {
    const dps = snapshot.roles.dps!.board;
    const matching = readArchivedRatingChanges("wow-forever", 10, {
      rankingContextId: dps.activeContext!.id,
      toVersionId: dps.version!.id,
    });
    expect(matching).toHaveLength(snapshot.roles.dps!.changes.length);
  });

  it("declares change coverage the reader can rely on", () => {
    const coverage = snapshot.provenance.coverage;
    expect(coverage?.changesLimit).toBe(10);
    const archived = coverage?.versions.find(
      (version) => version.versionId === snapshot.provenance.versionId,
    );
    expect(archived?.complete).toBe(true);
    expect(archived?.roles.slice().sort()).toEqual(["dps", "healer", "tank"]);
  });

  it("falls back to SQL instead of reporting uncovered change queries as empty", () => {
    const dps = snapshot.roles.dps!.board;
    // Context the artifact never captured.
    expect(
      readArchivedRatingChanges("wow-forever", 10, {
        rankingContextId: "some-other-context",
        toVersionId: dps.version!.id,
      }),
    ).toBeNull();
    // Wider window than the exported one.
    expect(
      readArchivedRatingChanges("wow-forever", 50, { toVersionId: dps.version!.id }),
    ).toBeNull();
    // Unfiltered queries span versions the artifact never captured.
    expect(readArchivedRatingChanges("wow-forever", 10)).toBeNull();
    expect(readArchivedRatingChanges("genshin-impact", 10)).toBeNull();
  });
});
