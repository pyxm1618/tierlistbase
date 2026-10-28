import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { classKeys, globalSnapshot, taiwanSnapshot } from "@/modules/dragon-traveler-tier-list";

describe("Dragon Traveler product integration", () => {
  it("connects the public route to two independent server snapshots", () => {
    expect(routeRegistry.get("/dragon-traveler/tier-list").class).toBe("public_noindex");

    expect(globalSnapshot.id).toBe("global");
    expect(taiwanSnapshot.id).toBe("taiwan");
    expect(globalSnapshot.asOf).not.toBe("");
    expect(taiwanSnapshot.asOf).not.toBe("");
    expect(globalSnapshot.sourceLabel).not.toBe(taiwanSnapshot.sourceLabel);

    expect(globalSnapshot.luminaries.length).toBeGreaterThan(0);
    expect(taiwanSnapshot.luminaries.length).toBeGreaterThan(0);
    expect(globalSnapshot.luminaries).not.toEqual(taiwanSnapshot.luminaries);
  });

  it("keeps every ranked record inside the frozen class model and server taxonomy", () => {
    for (const snapshot of [globalSnapshot, taiwanSnapshot]) {
      const classes = new Set(classKeys);
      const factions = new Set(snapshot.factions.map((option) => option.key));
      const rarities = new Set(snapshot.rarities.map((option) => option.key));

      for (const luminary of snapshot.luminaries) {
        expect(classes.has(luminary.classKey)).toBe(true);
        expect(rarities.has(luminary.rarityKey)).toBe(true);
        expect(luminary.factionKeys.length).toBeGreaterThan(0);
        for (const faction of luminary.factionKeys) {
          expect(factions.has(faction)).toBe(true);
        }
      }
    }
  });
});
