import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));

import genshinSnapshot from "../../../src/modules/genshin-tier-list/archived-snapshots/genshin-impact.json";
import { readArchivedGenshinData } from "../../../src/modules/genshin-tier-list/archived-snapshot";
import { loadGenshinData } from "../../../src/modules/genshin-tier-list/data";

const editorialDirectory = path.join(process.cwd(), "data/editorial/genshin-impact/7.1");
type EditorialRating = { entitySlug: string; tier: string; primaryRole: string };
type EditorialCharacter = { slug: string; name: string };

const data = readArchivedGenshinData();

describe("Genshin archived ranking snapshot", () => {
  it("contains the full reviewed roster with portraits and evidence", () => {
    expect(data).not.toBeNull();
    expect(data?.characters).toHaveLength(121);
    expect(data?.version).toBe("7.1");
    expect(data?.context).toBe("endgame-overall");

    for (const character of data!.characters) {
      expect(character.avatar, `${character.name} avatar`).not.toBeNull();
      expect(character.avatar?.["128"]).toMatch(/^https:\/\/media\.tierlistbase\.com\//);
      expect(character.avatar?.["256"]).toMatch(/^https:\/\/media\.tierlistbase\.com\//);
      expect(character.tier, `${character.name} tier`).toBeTruthy();
      expect(character.primaryRole, `${character.name} role`).toBeTruthy();
      expect(character.whyThisTier.length, `${character.name} rationale`).toBeGreaterThan(0);
    }
    expect(data?.evidenceCount).toBe(130);
  });

  it("matches the human-approved editorial package cell by cell", () => {
    const master = JSON.parse(
      readFileSync(path.join(editorialDirectory, "character-master.json"), "utf8"),
    ) as EditorialCharacter[];
    const ratings = JSON.parse(
      readFileSync(path.join(editorialDirectory, "ratings.json"), "utf8"),
    ) as EditorialRating[];

    const slugByName = new Map(master.map((character) => [character.name, character.slug]));
    const ratingBySlug = new Map(ratings.map((rating) => [rating.entitySlug, rating]));

    expect(master).toHaveLength(121);
    expect(ratings).toHaveLength(121);
    expect(genshinSnapshot.provenance.editorialPackage).toBe("data/editorial/genshin-impact/7.1");

    for (const character of data!.characters) {
      const slug = slugByName.get(character.name);
      expect(slug, `${character.name} is in the approved roster`).toBeTruthy();
      const approved = ratingBySlug.get(slug!);
      expect(approved, `${slug} has an approved rating`).toBeTruthy();
      expect(character.tier, `${character.name} tier`).toBe(approved!.tier);
      expect(character.primaryRole, `${character.name} role`).toBe(approved!.primaryRole);
    }
  });

  it("serves the snapshot without opening a database read", async () => {
    const databaseAccess = vi.fn(() => {
      throw new Error("the archived read path must not touch the database");
    });
    vi.doMock("@/platform/database/application-database", () => ({
      get db() {
        return databaseAccess();
      },
      runWithRequestDatabase: databaseAccess,
    }));

    const result = await loadGenshinData();
    expect(result.status).toBe("available");
    expect(databaseAccess).not.toHaveBeenCalled();
    vi.doUnmock("@/platform/database/application-database");
  });

  it("still reads the database when a caller passes an explicit handle", async () => {
    const select = vi.fn(() => {
      throw new Error("explicit database handle used");
    });
    const result = await loadGenshinData({ select } as never);
    expect(select).toHaveBeenCalled();
    // The data layer fails closed rather than substituting the snapshot for a broken read.
    expect(result).toEqual({ status: "unavailable" });
  });
});
