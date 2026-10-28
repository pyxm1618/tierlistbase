import { describe, expect, it } from "vitest";

import {
  getOtherViableRoles,
  getQuickPick,
  getRanking,
  roleKeys,
  tiers,
  wildRiftSnapshot,
} from "@/modules/wild-rift-tier-list";

describe("Wild Rift reviewed snapshot integrity", () => {
  it("keeps champion ids unique", () => {
    const ids = wildRiftSnapshot.champions.map((champion) => champion.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("keeps every ranking on a valid Champion × Role key", () => {
    const championIds = new Set(wildRiftSnapshot.champions.map((champion) => champion.id));
    const keys = new Set<string>();

    for (const ranking of wildRiftSnapshot.rankings) {
      expect(championIds.has(ranking.championId)).toBe(true);
      expect(roleKeys).toContain(ranking.role);
      expect(tiers).toContain(ranking.tier);

      const key = `${ranking.championId}:${ranking.role}`;
      expect(keys.has(key)).toBe(false);
      keys.add(key);
    }
  });

  it("keeps WR, PR and BR within valid percentage bounds", () => {
    for (const ranking of wildRiftSnapshot.rankings) {
      for (const metric of [ranking.winRate, ranking.pickRate, ranking.banRate]) {
        if (metric === null) continue;
        expect(Number.isFinite(metric)).toBe(true);
        expect(metric).toBeGreaterThanOrEqual(0);
        expect(metric).toBeLessThanOrEqual(100);
      }
    }
  });

  it("derives each Quick Pick from the corresponding role ranking", () => {
    for (const role of roleKeys) {
      const quickPick = getQuickPick(role);
      const ranking = getRanking(quickPick.championId, role);
      expect(ranking).toBeDefined();
      expect(quickPick.tier).toBe(ranking?.tier);
    }
  });

  it("derives Other Viable Roles from the same ranking model", () => {
    expect(
      wildRiftSnapshot.rankings.some(
        (ranking) => getOtherViableRoles(ranking.championId, ranking.role).length > 0,
      ),
    ).toBe(true);

    for (const ranking of wildRiftSnapshot.rankings) {
      const expected = wildRiftSnapshot.rankings.filter(
        (candidate) =>
          candidate.championId === ranking.championId && candidate.role !== ranking.role,
      );
      expect(getOtherViableRoles(ranking.championId, ranking.role)).toEqual(expected);
    }
  });

  it("keeps reviewed changes tied to real rankings and current tiers", () => {
    for (const change of wildRiftSnapshot.changes) {
      const ranking = getRanking(change.championId, change.role);
      expect(ranking).toBeDefined();
      expect(ranking?.tier).toBe(change.newTier);
    }
  });

  it("keeps every source reference resolvable", () => {
    const sourceIds = new Set(wildRiftSnapshot.sources.map((source) => source.id));

    for (const ranking of wildRiftSnapshot.rankings) {
      expect(ranking.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of ranking.sourceIds) expect(sourceIds.has(sourceId)).toBe(true);
    }

    for (const change of wildRiftSnapshot.changes) {
      expect(change.sourceIds.length).toBeGreaterThan(0);
      for (const sourceId of change.sourceIds) expect(sourceIds.has(sourceId)).toBe(true);
    }
  });

  it("records complete snapshot and source context without claiming global data", () => {
    expect(wildRiftSnapshot.gameVersion).toBe("7.3c");
    expect(wildRiftSnapshot.latestRankedBalance).toBe("7.3b");
    expect(wildRiftSnapshot.snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(wildRiftSnapshot.region).toBe("China server");
    expect(wildRiftSnapshot.rankContext).toBe("Diamond+");
    expect(wildRiftSnapshot.queueContext).toBe("Ranked");

    for (const source of wildRiftSnapshot.sources) {
      expect(source.id.trim()).not.toBe("");
      expect(source.name.trim()).not.toBe("");
      expect(source.checkedAt).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(source.url.trim()).not.toBe("");
      expect(source.context.trim()).not.toBe("");
    }
  });

  it("contains exactly five role lists and no independent Overall Tier dataset", () => {
    expect(roleKeys).toEqual(["baron", "jungle", "mid", "dragon", "support"]);
    for (const role of roleKeys) {
      expect(
        wildRiftSnapshot.rankings.filter((ranking) => ranking.role === role).length,
      ).toBeGreaterThan(0);
    }
    expect("overallRankings" in wildRiftSnapshot).toBe(false);
    expect("overallTierList" in wildRiftSnapshot).toBe(false);
  });
});
