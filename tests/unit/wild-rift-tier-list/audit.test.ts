import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import raw from "../../../docs/wild-rift/reviewed-source-snapshot.json";
import tierEvidence from "../../../docs/wild-rift/reviewed-tier-evidence.json";
import ledger from "../../../docs/wild-rift/placement-audit.json";
import changeAudit from "../../../docs/wild-rift/change-audit.json";
import kitEvidence from "../../../docs/wild-rift/official-kit-evidence.json";
import { championForId, coverage } from "@/modules/wild-rift-tier-list";
import {
  changes,
  quickInsights,
  rankingFor,
  rankings,
  snapshot,
} from "@/modules/wild-rift-tier-list";

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
    expect(new Set(rankings.map((ranking) => ranking.whyThisTier)).size).toBe(209);
    for (const ranking of rankings) {
      const reference = kitEvidence.champions.find((row) => row.championId === ranking.championId);
      expect(ranking.abilitySourceUrl).toBe(reference?.url);
      expect(ranking.strengths).toHaveLength(2);
    }
    expect(championForId("norra").portraitKind).toBe("champion");
    expect(championForId("norra").portrait).toBe("/images/wild-rift/champions/norra.png");
  });

  it("pins the reviewed raw source fixture independently of UI rounding", () => {
    const digest = createHash("sha256")
      .update(readFileSync("docs/wild-rift/reviewed-source-snapshot.json"))
      .digest("hex");
    expect(digest).toBe("b948e98f45aee474c437f6ee110937ac14ea056ed653f0182375bde7e90ea077");
    expect(raw.placements).toHaveLength(180);
    expect(
      createHash("sha256")
        .update(readFileSync("docs/wild-rift/2026-11-07-reviewed-source-snapshot.json"))
        .digest("hex"),
    ).toBe(digest);
    expect(
      createHash("sha256")
        .update(readFileSync("docs/wild-rift/2026-10-28-reviewed-source-snapshot.json"))
        .digest("hex"),
    ).toBe("8abb7cf2adfcfa139e13f340515911f83867c9e63db57a3b8150cee2f783c259");
    expect(raw.trackedChampions).toBe(134);
    expect(raw.observedUniqueChampions).toBe(136);
    expect(raw.sourceUpdatedAt).toBe("2026-11-07");
    expect(raw.sourcePatchLabel).toBe("7.3e");
    expect(raw.latestRankedBalancePatch).toBe("7.3d");
  });

  it("reconciles every original placement with an explicit evidenced disposition", () => {
    expect(ledger.originalTotal).toBe(208);
    expect(ledger.placements).toHaveLength(209);
    expect(Object.values(ledger.states).reduce((sum, count) => sum + count, 0)).toBe(209);
    expect(ledger.states.unreviewed).toBe(0);
    expect(ledger.statisticsBecameAvailable).toEqual([
      { championId: "akali", role: "baron" },
      { championId: "jayce", role: "jungle" },
    ]);
    expect(ledger.statisticsBecameUnavailable).toEqual([{ championId: "diana", role: "mid" }]);
    expect(new Set(ledger.placements.map((row) => key(row.championId, row.role))).size).toBe(209);
    for (const row of ledger.placements) {
      expect(row.statisticsEvidence !== null || row.tierEvidence !== null).toBe(true);
      expect(row.status).toBe("approved");
    }
  });

  it("preserves every exact source rate and never borrows statistics across roles", () => {
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
    expect(verified).toBe(coverage.statisticsBackedPlacements);
    expect(verified).toBe(180);
    expect(unavailable).toBe(coverage.editorialPlacements);
    expect(unavailable).toBe(29);
  });

  it("keeps source tiers separately auditable and states which ones are carried forward", () => {
    expect(tierEvidence.placements).toHaveLength(209);
    expect(tierEvidence.summary).toEqual({ total: 209, currentCapture: 180, carriedForward: 29 });
    for (const ranking of rankings) {
      const evidence = sourceTiers.get(key(ranking.championId, ranking.role));
      expect(evidence).toBeDefined();
      expect(ranking.sourceTier).toBe(evidence?.sourceTier);
      expect(ranking.tier).toBe(ranking.sourceTier);
      expect(ranking.tierSourceId).toBe("core-editorial-tier");
      expect(ranking.editorialTierReason).toBeNull();
      expect(ranking.placementKind).toBe(
        statistics.has(key(ranking.championId, ranking.role)) ? "statistics-backed" : "editorial",
      );
      // A placement can only be carried forward when the current capture has no row for it.
      expect(evidence?.evidenceStatus).toBe(
        ranking.placementKind === "statistics-backed" ? "current-capture" : "carried-forward",
      );
      if (evidence?.evidenceStatus === "carried-forward") {
        expect(statistics.has(key(ranking.championId, ranking.role))).toBe(false);
      }
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
    expect(available).toBe(6);
    expect(available).toBe(coverage.verifiedTrendPlacements);
  });

  it("publishes only observed source-tier movements with previous tier, current tier, role and capture date", () => {
    expect(changeAudit.currentTotal).toBe(17);
    expect(changeAudit.changes).toHaveLength(17);
    expect(changeAudit.states).toEqual({
      approved: 17,
      deferred: 0,
      confirmed_reject: 0,
      unreviewed: 0,
    });
    expect(changeAudit.publishedTotal).toBe(17);
    expect(changes).toHaveLength(17);
    for (const change of changeAudit.changes) {
      const published = changes.find(
        (row) => row.championId === change.championId && row.role === change.role,
      );
      expect(published).toMatchObject({
        from: change.fromTier,
        to: change.toTier,
        date: change.date,
      });
      expect(published?.reason).toBe(change.reason);
      const ranking = rankings.find(
        (row) => row.championId === change.championId && row.role === change.role,
      );
      expect(ranking?.tier).toBe(change.toTier);
      expect(ranking?.sourceTier).toBe(change.toTier);
      expect(change.status).toBe("approved");
      expect(change.evidenceMissing).toEqual(["publisher-dated movement timestamp"]);
      expect(change.date).toBe(raw.sourceUpdatedAt);
    }
  });

  it("separates the current game version from the latest standard Ranked balance", () => {
    expect(snapshot.gameVersion).toBe("7.3e");
    expect(snapshot.latestRankedBalance).toBe("7.3d");
    expect(snapshot.statisticsPatch).toBe(raw.sourcePatchLabel);
    expect(snapshot.snapshotDate).toBe(raw.sourceUpdatedAt);
    expect(snapshot.snapshotDate).toBe("2026-11-07");
    expect(snapshot.reviewedAt).toBe("2026-11-09");
    expect(snapshot.postBalanceStatisticsVerified).toBe(true);
    expect(raw.postBalanceStatisticsVerified).toBe(true);
    expect(raw.sourceCapture).toContain("Updated 2026-11-07");
    for (const ranking of rankings) {
      expect(ranking.patchImpact).toContain("7.3d");
      expect(ranking.patchImpact).not.toContain("outcome statistics are not verified");
      expect(ranking.whyThisTier).toContain("latest Ranked balance 7.3d");
      expect(ranking.whyThisTier).toContain("Statistics snapshot 2026-11-07");
    }
  });

  it("reports a Biggest Riser only where a positive same-role seven-day delta exists", () => {
    const riserRoles = (["baron", "jungle", "mid", "dragon", "support"] as const).filter((role) =>
      quickInsights[role].some((row) => row.label === "Biggest Riser"),
    );
    expect(riserRoles).toEqual(["baron", "jungle", "mid"]);
    for (const role of ["dragon", "support"] as const) {
      expect(rankings.some((row) => row.role === role && (row.winRateChange7d ?? 0) > 0)).toBe(
        false,
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
