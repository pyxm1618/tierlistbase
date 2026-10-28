import { describe, expect, it } from "vitest";

import {
  classKeys,
  globalFactionKeys,
  globalRarityKeys,
  globalSnapshot,
  taiwanFactionKeys,
  taiwanRarityKeys,
  taiwanSnapshot,
} from "@/modules/dragon-traveler-tier-list";

describe("Dragon Traveler live snapshot taxonomy", () => {
  it("keeps the verified six classes without sharing a cross-server faction key", () => {
    expect(classKeys).toEqual(["Guardian", "Warrior", "Assassin", "Archer", "Mage", "Priest"]);
    expect(globalFactionKeys).toEqual([
      "Sanctum Glory",
      "Wild Spirit",
      "Arcane Wisdom",
      "Elemental Echo",
      "Illusion Veil",
      "Otherworld Return",
    ]);
    expect(taiwanFactionKeys).toEqual([
      "聖堂榮光",
      "曠野之靈",
      "奧術智慧",
      "元素迴響",
      "幻境秘影",
      "彼岸再臨",
    ]);
    expect(globalFactionKeys).not.toEqual(taiwanFactionKeys);
  });

  it("uses server-specific live rarity terminology and removes the rejected placeholders", () => {
    expect(globalRarityKeys).toEqual(["SSR Ex", "SSR+", "SSR", "SR", "R", "N"]);
    expect(taiwanRarityKeys).toEqual(["傳說‧神話", "傳說+", "傳說", "史詩", "菁英", "普通"]);

    const rejected = ["Mythic", "Legendary", "Epic", "UR"];
    expect(globalRarityKeys.some((rarity) => rejected.includes(rarity))).toBe(false);
    expect(taiwanRarityKeys.some((rarity) => rejected.includes(rarity))).toBe(false);
  });

  it.each([globalSnapshot, taiwanSnapshot])(
    "keeps every ranked record inside its own server taxonomy",
    (snapshot) => {
      const ids = snapshot.luminaries.map((luminary) => luminary.id);
      expect(new Set(ids).size).toBe(ids.length);
      expect(snapshot.luminaries.length).toBeGreaterThan(30);

      for (const luminary of snapshot.luminaries) {
        expect(classKeys).toContain(luminary.classKey);
        expect(snapshot.rarityKeys).toContain(luminary.rarity);
        expect(luminary.factions.length).toBeGreaterThan(0);
        for (const faction of luminary.factions) {
          expect(snapshot.factionKeys).toContain(faction);
        }
      }
    },
  );

  it("includes the current October server-specific additions used by account decisions", () => {
    const globalNames = globalSnapshot.luminaries.map((luminary) => luminary.name);
    const taiwanNames = taiwanSnapshot.luminaries.map((luminary) => luminary.name);

    expect(globalNames).toContain("Hela");
    expect(globalNames).toContain("Arachne");
    expect(taiwanNames).toContain("Hypnos");
    expect(taiwanNames).toContain("Gaia");
  });
});
