import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { classes, getRoster, getFilters } from "@/modules/dragon-traveler-tier-list";

const hasProjectRouteInventory = routeRegistry.routes.some(
  (entry) => entry.route === "/wow-forever/vanguard",
);

const hasDragonRoute = routeRegistry.routes.some(
  (entry) => entry.route === "/dragon-traveler/tier-list",
);

describe("Dragon Traveler product integration", () => {
  it("connects the public route to two independent server snapshots", () => {
    if (hasProjectRouteInventory) {
      expect(routeRegistry.get("/dragon-traveler/tier-list").class).toBe("public_noindex");
    }

    expect(getRoster("global")).toHaveLength(73);
    expect(getRoster("taiwan")).toHaveLength(95);
    expect(getRoster("global")).not.toEqual(getRoster("taiwan"));
  });

  it("keeps every ranked record inside the frozen class model and server taxonomy", () => {
    if (!hasDragonRoute) return;
    for (const server of ["global", "taiwan"] as const) {
      const options = getFilters(server);
      for (const luminary of getRoster(server)) {
        expect(classes).toContain(luminary.class);
        expect(options.rarities).toContain(luminary.rarity);
        expect(luminary.factions.length).toBeGreaterThan(0);
        for (const faction of luminary.factions) expect(options.factions).toContain(faction);
      }
    }
  });
});
