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
});
