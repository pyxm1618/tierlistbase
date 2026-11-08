import { describe, expect, it } from "vitest";

import { gamesConfig } from "@/config/games.config";
import { routeRegistry } from "@/config/routes.config";
import {
  PHANTOM_BLADE_ZERO_ROUTE,
  getPhantomBladeZeroReleaseReadiness,
  phantomBladeZeroSnapshot,
} from "@/modules/phantom-blade-zero-tier-list";

describe("Phantom Blade Zero module integration", () => {
  it("connects the shared navigation registry to the released route", () => {
    const game = gamesConfig.find((entry) => entry.slug === "phantom-blade-zero");
    expect(game).toMatchObject({
      name: "Phantom Blade Zero",
      tierListHref: PHANTOM_BLADE_ZERO_ROUTE,
      navigationVisible: true,
      navigationOrder: 6,
    });
    expect(routeRegistry.get(PHANTOM_BLADE_ZERO_ROUTE).class).toBe("public_indexable");
  });

  it("opens the P0 release gate after all required local assets are verified", () => {
    expect(phantomBladeZeroSnapshot.mainWeapons).toHaveLength(21);
    expect(phantomBladeZeroSnapshot.phantomEdges).toHaveLength(14);
    expect(getPhantomBladeZeroReleaseReadiness()).toMatchObject({
      ready: true,
      required: 36,
      verified: 36,
      missing: [],
    });
  });

  it("preserves the reviewed evidence snapshot after the post-snapshot re-check", () => {
    // Mobalytics qualified as an independent Main Weapon ranking, so the
    // evidence package changed and the snapshot moved to the review date.
    expect(phantomBladeZeroSnapshot.snapshotDate).toBe("2026-11-08");
    expect(phantomBladeZeroSnapshot.sources).toHaveLength(11);
  });

  it("counts only independent ranking sources as tier evidence", () => {
    const byNature = (nature: string) =>
      phantomBladeZeroSnapshot.sources.filter((source) => source.nature === nature);

    expect(byNature("official")).toHaveLength(3);
    expect(byNature("ranking")).toHaveLength(4);
    expect(byNature("supporting")).toHaveLength(4);

    // Four ranking articles resolve to three independent publishers: KeenGamer
    // contributes both a Main Weapon and a Phantom Edge list under one group.
    const independentGroups = new Set(
      byNature("ranking").map((source) => source.independenceGroup ?? source.id),
    );
    expect(independentGroups).toEqual(new Set(["keengamer", "gamesgg", "mobalytics"]));

    // Supporting data must never be able to cast a tier vote.
    for (const source of byNature("supporting")) {
      expect(source.independenceGroup).toBeUndefined();
    }
  });

  it("keeps two-source consensus and Pending semantics intact", () => {
    for (const entity of [
      ...phantomBladeZeroSnapshot.mainWeapons,
      ...phantomBladeZeroSnapshot.phantomEdges,
    ]) {
      if (entity.independentSourceCount < 2) {
        expect(entity.finalTier).toBe("Pending");
        expect(entity.consensusTier).toBeNull();
      } else {
        expect(entity.finalTier).not.toBe("Pending");
      }
    }

    // Phantom Edges still rest on a single ranking source, so every entry stays Pending.
    expect(
      phantomBladeZeroSnapshot.phantomEdges.every((edge) => edge.finalTier === "Pending"),
    ).toBe(true);
    expect(
      Math.max(...phantomBladeZeroSnapshot.phantomEdges.map((edge) => edge.independentSourceCount)),
    ).toBe(1);

    // Every Main Weapon now clears the two-source gate, so none stays Pending.
    const countByTier = phantomBladeZeroSnapshot.mainWeapons.reduce<Record<string, number>>(
      (accumulator, entity) => {
        accumulator[entity.finalTier] = (accumulator[entity.finalTier] ?? 0) + 1;
        return accumulator;
      },
      {},
    );
    expect(countByTier).toEqual({ S: 6, A: 9, B: 6 });
    expect(countByTier.Pending).toBeUndefined();
  });
});
