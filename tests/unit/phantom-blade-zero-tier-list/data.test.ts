import { describe, expect, it } from "vitest";

import {
  getPhantomBladeZeroReleaseReadiness,
  phantomBladeZeroSnapshot,
  reviewPhantomBladeZeroEntity,
} from "@/modules/phantom-blade-zero-tier-list";
import { phantomBladeZeroAssetProvenance } from "@/modules/phantom-blade-zero-tier-list/asset-provenance";
import type { SourcePlacement } from "@/modules/phantom-blade-zero-tier-list/data";

describe("Phantom Blade Zero reviewed snapshot", () => {
  const allEntities = [
    ...phantomBladeZeroSnapshot.mainWeapons,
    ...phantomBladeZeroSnapshot.phantomEdges,
  ];

  it("keeps entity IDs unique and placements attached to real ranking sources", () => {
    expect(new Set(allEntities.map((entity) => entity.id)).size).toBe(allEntities.length);
    const rankingSourceIds = new Set(
      phantomBladeZeroSnapshot.sources
        .filter((source) => source.nature === "ranking")
        .map((source) => source.id),
    );

    for (const entity of allEntities) {
      expect(entity.placements.length).toBeGreaterThan(0);
      for (const placement of entity.placements) {
        expect(rankingSourceIds.has(placement.sourceId)).toBe(true);
      }
    }
  });

  it("requires two independent sources before a formal tier", () => {
    for (const entity of allEntities) {
      if (["S", "A", "B", "C"].includes(entity.finalTier)) {
        expect(entity.independentSourceCount).toBeGreaterThanOrEqual(2);
      }
    }

    const pending = reviewPhantomBladeZeroEntity({
      id: "single-source-check",
      name: "Single Source Check",
      kind: "main_weapon",
      category: "Test",
      bestFor: ["Test"],
      easeOfUse: "Needs Review",
      strengths: ["Test"],
      limitations: ["Test"],
      whyThisTier: "Test fixture.",
      acquisition: "Test fixture.",
      mechanics: ["Test"],
      placements: [{ sourceId: "keen-main", method: "tier", tier: "S" }],
    });
    expect(pending.finalTier).toBe("Pending");
  });

  it("is deterministic after supporting-only sources are removed from tier voting", () => {
    for (const entity of allEntities) {
      const once = reviewPhantomBladeZeroEntity(entity);
      const twice = reviewPhantomBladeZeroEntity(entity);
      expect(once.finalTier).toBe(twice.finalTier);
      expect(once.consensusTier).toBe(twice.consensusTier);
    }

    expect(
      phantomBladeZeroSnapshot.phantomEdges.find((entity) => entity.id === "hunters-chain-sickle")
        ?.finalTier,
    ).toBe("Pending");
  });

  it("keeps every reviewed Phantom Edge Pending until a second comprehensive ranking exists", () => {
    expect(phantomBladeZeroSnapshot.phantomEdges).toHaveLength(14);
    for (const entity of phantomBladeZeroSnapshot.phantomEdges) {
      expect(entity.independentSourceCount).toBe(1);
      expect(entity.consensusTier).toBeNull();
      expect(entity.finalTier).toBe("Pending");
      expect(entity.disagreement).toBe(false);
    }

    const supportingIds = new Set(
      phantomBladeZeroSnapshot.sources
        .filter((source) => source.nature === "supporting")
        .map((source) => source.id),
    );
    expect(supportingIds).toContain("allthings-edge-stats");
    expect(supportingIds).toContain("gamesgg-edge");
  });

  it("keeps missing source coverage as Pending instead of zero", () => {
    const singleSource = reviewPhantomBladeZeroEntity({
      id: "single-ranking-source",
      name: "Single Ranking Source",
      kind: "main_weapon",
      category: "Test",
      bestFor: ["Test"],
      easeOfUse: "Needs Review",
      strengths: ["Test"],
      limitations: ["Test"],
      whyThisTier: "Test fixture.",
      acquisition: "Test fixture.",
      mechanics: ["Test"],
      placements: [{ sourceId: "keen-main", method: "tier", tier: "S" }],
    });

    expect(singleSource.independentSourceCount).toBe(1);
    expect(singleSource.consensusTier).toBeNull();
    expect(singleSource.finalTier).toBe("Pending");

    // A second qualifying ranking source is what ends Pending; the coverage gap
    // itself is never scored as a zero-tier vote.
    const twoSources = reviewPhantomBladeZeroEntity({
      ...singleSource,
      placements: [
        { sourceId: "keen-main", method: "tier", tier: "A" },
        { sourceId: "mobalytics-main", method: "tier", tier: "B" },
      ],
    });
    expect(twoSources.independentSourceCount).toBe(2);
    expect(twoSources.consensusTier).toBe("B");
    expect(twoSources.finalTier).toBe("B");
  });

  it("never lets a supporting placement reach the consensus calculation", () => {
    const base = {
      id: "supporting-pollution-check",
      name: "Supporting Pollution Check",
      kind: "main_weapon" as const,
      category: "Test",
      bestFor: ["Test"],
      easeOfUse: "Needs Review" as const,
      strengths: ["Test"],
      limitations: ["Test"],
      whyThisTier: "Test fixture.",
      acquisition: "Test fixture.",
      mechanics: ["Test"],
      placements: [
        { sourceId: "keen-main", method: "tier" as const, tier: "S" as const },
        { sourceId: "gamesgg-main", method: "tier" as const, tier: "S" as const },
      ],
    };

    const rankingOnly = reviewPhantomBladeZeroEntity(base);

    // A supporting placement extreme enough to flip the mean, the disagreement
    // flag, and the final tier if it were ever treated as a tier vote.
    const withSupporting = reviewPhantomBladeZeroEntity({
      ...base,
      placements: [
        ...base.placements,
        { sourceId: "pushsquare-weapons", method: "tier", tier: "C" },
      ],
    });

    expect(withSupporting.independentSourceCount).toBe(rankingOnly.independentSourceCount);
    expect(withSupporting.consensusTier).toBe(rankingOnly.consensusTier);
    expect(withSupporting.finalTier).toBe(rankingOnly.finalTier);
    expect(withSupporting.disagreement).toBe(rankingOnly.disagreement);

    // Guard against a no-op fixture: the supporting vote would have changed the
    // outcome if it had been counted.
    expect(rankingOnly.consensusTier).toBe("S");
    expect(rankingOnly.finalTier).toBe("S");
    expect(rankingOnly.disagreement).toBe(false);
    expect(rankingOnly.independentSourceCount).toBe(2);
  });

  it("resolves an exact 0.8 boundary to S instead of losing it to floating point", () => {
    const fixture = (placements: readonly SourcePlacement[]) =>
      reviewPhantomBladeZeroEntity({
        id: "floating-boundary-fixture",
        name: "Floating Boundary Fixture",
        kind: "main_weapon",
        category: "Test",
        bestFor: ["Test"],
        easeOfUse: "Needs Review",
        strengths: ["Test"],
        limitations: ["Test"],
        whyThisTier: "Test fixture.",
        acquisition: "Test fixture.",
        mechanics: ["Test"],
        placements,
      });

    // Premise of the defect, asserted independently of the PBZ snapshot: the
    // mathematical mean is exactly 0.8, but binary floating point reports less.
    const tiers = [1, 0.7, 0.7] as const;
    expect(tiers.reduce((sum, value) => sum + value, 0) / tiers.length).toBeLessThan(0.8);

    const boundary = fixture([
      { sourceId: "keen-main", method: "tier", tier: "S" },
      { sourceId: "gamesgg-main", method: "tier", tier: "A" },
      { sourceId: "mobalytics-main", method: "tier", tier: "A" },
    ]);

    expect(boundary.consensusTier).toBe("S");
    expect(boundary.finalTier).toBe("S");
    expect(boundary.disagreement).toBe(false);

    // The same boundary must hold regardless of placement order.
    const reordered = fixture([
      { sourceId: "keen-main", method: "tier", tier: "A" },
      { sourceId: "gamesgg-main", method: "tier", tier: "S" },
      { sourceId: "mobalytics-main", method: "tier", tier: "A" },
    ]);
    expect(reordered.consensusTier).toBe("S");

    // 0.7 + 0.7 + 0.4 = 0.6 and 0.4 + 0.4 + 0.4 = 0.4 are the other two
    // published boundaries and must stay exactly on their tiers.
    expect(
      fixture([
        { sourceId: "keen-main", method: "tier", tier: "A" },
        { sourceId: "gamesgg-main", method: "tier", tier: "A" },
        { sourceId: "mobalytics-main", method: "tier", tier: "B" },
      ]).consensusTier,
    ).toBe("A");

    expect(
      fixture([
        { sourceId: "keen-main", method: "tier", tier: "B" },
        { sourceId: "gamesgg-main", method: "tier", tier: "B" },
        { sourceId: "mobalytics-main", method: "tier", tier: "B" },
      ]).consensusTier,
    ).toBe("B");
  });

  it("keeps a score that is genuinely below a boundary on the lower tier", () => {
    const fixture = (placements: readonly SourcePlacement[]) =>
      reviewPhantomBladeZeroEntity({
        id: "floating-lower-boundary-fixture",
        name: "Floating Lower Boundary Fixture",
        kind: "main_weapon",
        category: "Test",
        bestFor: ["Test"],
        easeOfUse: "Needs Review",
        strengths: ["Test"],
        limitations: ["Test"],
        whyThisTier: "Test fixture.",
        acquisition: "Test fixture.",
        mechanics: ["Test"],
        placements,
      });

    // 1.0, 0.7 and an ordinal worth ~0.69997 average to ~0.79999, which is
    // below the S boundary by far more than any rounding tolerance.
    const justBelowS = fixture([
      { sourceId: "keen-main", method: "tier", tier: "S" },
      { sourceId: "gamesgg-main", method: "tier", tier: "A" },
      { sourceId: "mobalytics-main", method: "ordinal", rank: 3001, fieldSize: 10000 },
    ]);
    expect(justBelowS.consensusTier).toBe("A");

    // 0.7 + 0.4 + 0.4 = 0.5 sits clearly below the A boundary.
    const belowA = fixture([
      { sourceId: "keen-main", method: "tier", tier: "A" },
      { sourceId: "gamesgg-main", method: "tier", tier: "B" },
      { sourceId: "mobalytics-main", method: "tier", tier: "B" },
    ]);
    expect(belowA.consensusTier).toBe("B");

    // 0.4 + 0.1 + 0.1 = 0.2 sits clearly below the B boundary.
    const belowB = fixture([
      { sourceId: "keen-main", method: "tier", tier: "B" },
      { sourceId: "gamesgg-main", method: "tier", tier: "C" },
      { sourceId: "mobalytics-main", method: "tier", tier: "C" },
    ]);
    expect(belowB.consensusTier).toBe("C");
  });

  it("never accepts an override without reason and evidence", () => {
    expect(() =>
      reviewPhantomBladeZeroEntity({
        id: "bad-override",
        name: "Bad Override",
        kind: "main_weapon",
        category: "Test",
        bestFor: ["Test"],
        easeOfUse: "Needs Review",
        strengths: ["Test"],
        limitations: ["Test"],
        whyThisTier: "Test fixture.",
        acquisition: "Test fixture.",
        mechanics: ["Test"],
        placements: [
          { sourceId: "keen-main", method: "tier", tier: "S" },
          { sourceId: "gamesgg-main", method: "tier", tier: "S" },
        ],
        override: { finalTier: "A", reason: "", supportingEvidence: [] },
      }),
    ).toThrow(/requires a reason and supporting evidence/);
  });

  it("separates official arsenal scale from reviewed coverage", () => {
    expect(phantomBladeZeroSnapshot.officialScale.mainWeapons).toBe("30+");
    expect(phantomBladeZeroSnapshot.officialScale.phantomEdges).toBe(25);
    expect(phantomBladeZeroSnapshot.mainWeapons).toHaveLength(21);
    expect(phantomBladeZeroSnapshot.phantomEdges).toHaveLength(14);
  });

  it("records the reviewed evidence package without drifting from the snapshot date", () => {
    expect(phantomBladeZeroSnapshot.snapshotDate).toBe("2026-11-08");
    expect(phantomBladeZeroSnapshot.whatChanged).toBe(
      "Mobalytics was added as an independent Main Weapon ranking source on 8 November 2026, so the evidence package was reviewed again. Main Weapons with Mobalytics coverage now carry three independent placements. Seamless Death left Pending for B, Baishan Stormswords and Whiteshadow moved from A to S, and no Phantom Edge changed.",
    );
  });

  it("re-verifies Mobalytics as an independent qualifying Main Weapon ranking source", () => {
    const mobalytics = phantomBladeZeroSnapshot.sources.find(
      (source) => source.id === "mobalytics-main",
    );

    expect(mobalytics).toMatchObject({
      nature: "ranking",
      independenceGroup: "mobalytics",
      url: "https://mobalytics.gg/gamebase/guides/phantom-blade-zero-weapon-tier-list",
    });

    // Mobalytics must never share an independence group with the incumbent
    // ranking publishers, or the two-source gate would double-count one voice.
    const groups = phantomBladeZeroSnapshot.sources
      .filter((source) => source.nature === "ranking")
      .map((source) => source.independenceGroup);
    expect(groups.filter((group) => group === "mobalytics")).toHaveLength(1);
    expect(new Set(groups)).toEqual(new Set(["keengamer", "gamesgg", "mobalytics"]));

    // Every mapped placement must be a real, named Main Weapon placement.
    const mapped = phantomBladeZeroSnapshot.mainWeapons.filter((entity) =>
      entity.placements.some((placement) => placement.sourceId === "mobalytics-main"),
    );
    expect(mapped.length).toBeGreaterThan(0);
    for (const entity of mapped) {
      const placement = entity.placements.find((entry) => entry.sourceId === "mobalytics-main");
      expect(placement?.method).toBe("tier");
      expect(["S", "A", "B", "C"]).toContain(placement?.method === "tier" ? placement.tier : "");
    }
    expect(mapped.map((entity) => entity.id)).toEqual([
      "jagged-steel",
      "white-serpent-crimson-viper",
      "fiend-saws",
      "freezing-chaos",
      "soft-snake-sword",
      "seamless-death",
      "parting-hooks",
      "scarlet-wraithblade",
      "baishan-stormswords",
      "sundering-dual-axes",
      "whiteshadow",
      "juggernaut",
      "outlaw-warblade",
      "wooden-sanguine",
      "armybreaker",
      "wild-oriole-sword",
      "the-fanatics-broken-blade",
      "sanguine-twin",
      "sanguine-reach",
      "sanguine",
      "tianxuan-bronze-sword",
    ]);
  });

  it("locks the reviewed source totals and Main Weapon tier distribution", () => {
    const byNature = (nature: string) =>
      phantomBladeZeroSnapshot.sources.filter((source) => source.nature === nature);

    expect(phantomBladeZeroSnapshot.sources).toHaveLength(11);
    expect(byNature("official")).toHaveLength(3);
    expect(byNature("ranking")).toHaveLength(4);
    expect(byNature("supporting")).toHaveLength(4);

    const distributions = phantomBladeZeroSnapshot.mainWeapons.reduce<Record<string, number>>(
      (accumulator, entity) => {
        accumulator[entity.finalTier] = (accumulator[entity.finalTier] ?? 0) + 1;
        return accumulator;
      },
      {},
    );
    expect(distributions).toEqual({ S: 8, A: 7, B: 6 });
    expect(
      phantomBladeZeroSnapshot.mainWeapons.filter((entity) => entity.finalTier === "Pending"),
    ).toHaveLength(0);

    // Both A + A + S weapons sit on the exact 0.8 boundary and must resolve to S.
    for (const entityId of ["baishan-stormswords", "whiteshadow"]) {
      const entity = phantomBladeZeroSnapshot.mainWeapons.find((item) => item.id === entityId);
      expect(entity?.placements).toHaveLength(3);
      expect(entity?.consensusTier).toBe("S");
      expect(entity?.finalTier).toBe("S");
      expect(entity?.disagreement).toBe(false);
    }

    for (const entity of phantomBladeZeroSnapshot.mainWeapons) {
      expect(entity.independentSourceCount).toBeGreaterThanOrEqual(2);
      expect(entity.disagreement).toBe(false);
    }
  });

  it("maps every reviewed entity to a declared P0 tier-icon provenance record", () => {
    const mappedEntityIds = new Set(
      phantomBladeZeroAssetProvenance
        .filter((asset) => asset.role === "tier_icon")
        .map((asset) => asset.entityId),
    );
    expect(mappedEntityIds).toEqual(new Set(allEntities.map((entity) => entity.id)));
  });

  it("opens the P0 release gate only when all 36 local binaries have complete provenance", () => {
    expect(phantomBladeZeroAssetProvenance).toHaveLength(36);
    const readiness = getPhantomBladeZeroReleaseReadiness();
    expect(readiness).toMatchObject({ ready: true, required: 36, verified: 36 });
    expect(readiness.missing).toHaveLength(0);

    for (const asset of phantomBladeZeroAssetProvenance) {
      expect(asset.status).toBe("verified_local");
      expect(asset.localPath).toMatch(/^\/images\/phantom-blade-zero\/.+\.webp$/);
      if (asset.sourceType === "user_provided_design_asset") {
        expect(asset.sourceUrl).toMatch(/^user-provided:\/\//);
        expect(asset.sourcePage).toBe("Final design asset supplied for PR #117 closeout");
      } else {
        expect(asset.sourceUrl).toMatch(/^https:\/\//);
        expect(asset.sourcePage).toMatch(/^https:\/\//);
      }
      expect(asset.sourceSha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.sha256).toMatch(/^[a-f0-9]{64}$/);
      expect(asset.originalDimensions?.width).toBeGreaterThan(0);
      expect(asset.originalDimensions?.height).toBeGreaterThan(0);
      expect(asset.outputDimensions?.width).toBeGreaterThan(0);
      expect(asset.outputDimensions?.height).toBeGreaterThan(0);
      expect(asset.transform).toBeTruthy();
    }
  });
});
