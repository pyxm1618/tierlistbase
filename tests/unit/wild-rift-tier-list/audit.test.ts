import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import raw from "../../../docs/wild-rift/reviewed-source-snapshot.json";
import tierEvidence from "../../../docs/wild-rift/reviewed-tier-evidence.json";
import ledger from "../../../docs/wild-rift/placement-audit.json";
import changeAudit from "../../../docs/wild-rift/change-audit.json";
import kitEvidence from "../../../docs/wild-rift/official-kit-evidence.json";
import { championForId } from "@/modules/wild-rift-tier-list";
import { changes, quickInsights, rankingFor, rankings } from "@/modules/wild-rift-tier-list";

const aliases: Readonly<Record<string, string>> = {
  "cho-gath": "chogath",
  "k-sante": "ksante",
  "kha-zix": "khazix",
  "vel-koz": "velkoz",
  "kog-maw": "kogmaw",
  "kai-sa": "kaisa",
};
const key = (championId: string, role: string) => `${championId}:${role}`;
const statistics = new Map(
  raw.placements.map((row) => [key(aliases[row.championSlug] ?? row.championSlug, row.role), row]),
);
const sourceTiers = new Map(
  tierEvidence.placements.map((row) => [key(row.championId, row.role), row]),
);

describe("Wild Rift source integrity closeout", () => {
  it("uses explicit role assessments instead of equating high tier with safe or easy", () => {
    expect(rankingFor("malphite", "baron")?.decisionSignals.blindPickSafety).toBe("Medium");
    expect(rankingFor("rammus", "jungle")?.decisionSignals.blindPickSafety).toBe("Low");
    expect(rankingFor("hwei", "mid")?.decisionSignals.easeOfExecution).toBe("Low");
    expect(rankingFor("yuumi", "support")?.decisionSignals.teamDependence).toBe("High");
    for (const ranking of rankings) {
      expect(ranking.strengths.join(" ")).not.toMatch(
        /role placement|win-rate signal|role review explicitly/i,
      );
      expect(ranking.limitations).toHaveLength(2);
      expect(ranking.whyThisTier).toContain("TierListBase retains");
      expect(ranking.whyThisTier).toContain("Wild Rift Core");
    }
  });

  it("keeps all individual content reviews tied to real primary ability references", () => {
    expect(kitEvidence.champions).toHaveLength(142);
    expect(kitEvidence.champions.every((row) => row.status === "fetched")).toBe(true);
    expect(new Set(rankings.map((ranking) => ranking.whyThisTier)).size).toBe(208);
    for (const ranking of rankings) {
      const reference = kitEvidence.champions.find((row) => row.championId === ranking.championId);
      expect(ranking.abilitySourceUrl).toBe(reference?.url);
      expect(ranking.strengths).toHaveLength(2);
    }
    expect(championForId("norra").portraitKind).toBe("placeholder");
    expect(championForId("norra").portrait).toBe("/images/wild-rift/champions/norra.svg");
  });

  it("pins the reviewed raw source fixture independently of UI rounding", () => {
    const digest = createHash("sha256")
      .update(readFileSync("docs/wild-rift/reviewed-source-snapshot.json"))
      .digest("hex");
    expect(digest).toBe("8abb7cf2adfcfa139e13f340515911f83867c9e63db57a3b8150cee2f783c259");
    expect(raw.placements).toHaveLength(181);
    expect(raw.trackedChampions).toBe(134);
    expect(raw.observedUniqueChampions).toBe(136);
  });

  it("reconciles every original placement with an explicit evidenced disposition", () => {
    expect(ledger.originalTotal).toBe(208);
    expect(ledger.placements).toHaveLength(208);
    expect(Object.values(ledger.states).reduce((sum, count) => sum + count, 0)).toBe(208);
    expect(ledger.states.unreviewed).toBe(0);
    expect(new Set(ledger.placements.map((row) => key(row.championId, row.role))).size).toBe(208);
    for (const row of ledger.placements) {
      expect(row.statisticsEvidence !== null || row.tierEvidence !== null).toBe(true);
    }
  });

  it("preserves all 543 exact source rates and never borrows statistics across roles", () => {
    let verified = 0;
    let unavailable = 0;
    for (const ranking of rankings) {
      const row = statistics.get(key(ranking.championId, ranking.role));
      if (row) {
        expect(
          [ranking.winRate, ranking.pickRate, ranking.banRate],
          key(ranking.championId, ranking.role),
        ).toEqual([Number(row.winRate), Number(row.pickRate), Number(row.banRate)]);
        verified++;
      } else {
        expect(
          [ranking.winRate, ranking.pickRate, ranking.banRate],
          key(ranking.championId, ranking.role),
        ).toEqual([null, null, null]);
        unavailable++;
      }
    }
    expect(verified).toBe(181);
    expect(unavailable).toBe(27);
  });

  it("keeps source tiers and any editorial overrides separately auditable", () => {
    for (const ranking of rankings) {
      const evidence = sourceTiers.get(key(ranking.championId, ranking.role));
      expect(evidence).toBeDefined();
      expect(ranking.sourceTier).toBe(evidence?.sourceTier);
      expect(ranking.tierSourceId).toBe("core-editorial-tier");
      if (ranking.tier !== ranking.sourceTier)
        expect(ranking.editorialTierReason?.trim()).toBeTruthy();
      else expect(ranking.editorialTierReason).toBeNull();
      expect(ranking.placementKind).toBe(
        statistics.has(key(ranking.championId, ranking.role)) ? "statistics-backed" : "editorial",
      );
    }
  });

  it("derives arrows only from exact same-role 7-day evidence", () => {
    let available = 0;
    for (const ranking of rankings) {
      const delta = statistics.get(key(ranking.championId, ranking.role))?.winRateChange7d ?? null;
      expect(ranking.winRateChange7d).toBe(delta);
      expect(ranking.trend).toBe(
        delta === null ? "unavailable" : delta > 0 ? "up" : delta < 0 ? "down" : "flat",
      );
      if (delta !== null) available++;
    }
    expect(available).toBe(136);
  });

  it("withholds every change whose causal reason is unverified and reconciles all 16 originals", () => {
    expect(changeAudit.originalTotal).toBe(16);
    expect(changeAudit.changes).toHaveLength(16);
    expect(changeAudit.states).toEqual({
      approved: 0,
      deferred: 16,
      confirmed_reject: 0,
      unreviewed: 0,
    });
    expect(Object.values(changeAudit.states).reduce((sum, count) => sum + count, 0)).toBe(16);
    expect(changes).toHaveLength(0);
    for (const change of changeAudit.changes) {
      const evidence = tierEvidence.changes.find(
        (row) => row.championId === change.championId && row.role === change.role,
      );
      expect(evidence).toMatchObject({
        fromTier: change.fromTier,
        toTier: change.toTier,
        date: change.date,
      });
      expect(change.status).toBe("deferred");
      expect(change.evidenceMissing).toContain(
        "causal reason for this Champion × Role tier movement",
      );
    }
  });

  it("supports each Biggest Riser with the largest available same-role seven-day change", () => {
    for (const [role, insights] of Object.entries(quickInsights)) {
      const insight = insights.find((item) => item.label === "Biggest Riser");
      if (!insight) continue;
      const ranking = rankings.find(
        (row) => row.championId === insight.championId && row.role === role,
      );
      const available = rankings.filter((row) => row.role === role && row.winRateChange7d !== null);
      expect(ranking?.winRateChange7d).toBe(
        Math.max(...available.map((row) => row.winRateChange7d ?? -Infinity)),
      );
    }
  });
});
