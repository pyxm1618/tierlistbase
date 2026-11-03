import { describe, expect, it } from "vitest";

import { gamesConfig } from "@/config/games.config";
import { routeRegistry } from "@/config/routes.config";
import {
  PHANTOM_BLADE_ZERO_ROUTE,
  getPhantomBladeZeroReleaseReadiness,
  phantomBladeZeroSnapshot,
} from "@/modules/phantom-blade-zero-tier-list";

describe("Phantom Blade Zero module integration", () => {
  it("connects the shared navigation registry to the preview route", () => {
    const game = gamesConfig.find((entry) => entry.slug === "phantom-blade-zero");
    expect(game).toMatchObject({
      name: "Phantom Blade Zero",
      tierListHref: PHANTOM_BLADE_ZERO_ROUTE,
      navigationVisible: true,
      navigationOrder: 6,
    });
    expect(routeRegistry.get(PHANTOM_BLADE_ZERO_ROUTE).class).toBe("public_noindex");
  });

  it("keeps reviewed data usable while the P0 release gate stays closed", () => {
    expect(phantomBladeZeroSnapshot.mainWeapons.length).toBeGreaterThan(0);
    expect(phantomBladeZeroSnapshot.phantomEdges.length).toBeGreaterThan(0);
    expect(getPhantomBladeZeroReleaseReadiness().ready).toBe(false);
  });
});
