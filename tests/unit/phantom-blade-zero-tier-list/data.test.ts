import { describe, expect, it } from "vitest";

import {
  getPhantomBladeZeroReleaseReadiness,
  phantomBladeZeroSnapshot,
  reviewPhantomBladeZeroEntity,
} from "@/modules/phantom-blade-zero-tier-list";
import { phantomBladeZeroAssetProvenance } from "@/modules/phantom-blade-zero-tier-list/asset-provenance";

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
    const seamless = phantomBladeZeroSnapshot.mainWeapons.find(
      (entity) => entity.id === "seamless-death",
    );
    expect(seamless?.independentSourceCount).toBe(1);
    expect(seamless?.consensusTier).toBeNull();
    expect(seamless?.finalTier).toBe("Pending");
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

  it("keeps first-snapshot history honest", () => {
    expect(phantomBladeZeroSnapshot.whatChanged).toBe(
      "First TierListBase snapshot. No previous verified snapshot exists, so no tier movements are claimed.",
    );
  });

  it("maps every reviewed entity to a declared P0 tier-icon provenance record", () => {
    const mappedEntityIds = new Set(
      phantomBladeZeroAssetProvenance
        .filter((asset) => asset.role === "tier_icon")
        .map((asset) => asset.entityId),
    );
    expect(mappedEntityIds).toEqual(new Set(allEntities.map((entity) => entity.id)));
  });

  it("fails the release gate while any P0 binary is missing", () => {
    expect(phantomBladeZeroAssetProvenance).toHaveLength(36);
    const readiness = getPhantomBladeZeroReleaseReadiness();
    expect(readiness).toMatchObject({ ready: false, required: 36, verified: 0 });
    expect(readiness.missing).toHaveLength(36);
    expect(
      phantomBladeZeroAssetProvenance.every(
        (asset) => asset.status === "source_verified_binary_missing" && asset.localPath === null,
      ),
    ).toBe(true);
  });
});
