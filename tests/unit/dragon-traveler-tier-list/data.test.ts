import { describe, expect, it } from "vitest";

import {
  classKeys,
  globalFactionOptions,
  globalRarityOptions,
  globalSnapshot,
  taiwanFactionOptions,
  taiwanRarityOptions,
  taiwanSnapshot,
} from "@/modules/dragon-traveler-tier-list";
import type { ServerSnapshot } from "@/modules/dragon-traveler-tier-list";

function labels(options: readonly { label: string }[]) {
  return options.map((option) => option.label);
}

describe("Dragon Traveler server snapshots", () => {
  it("keeps the verified six classes without inventing extra class systems", () => {
    expect(classKeys).toEqual(["Guardian", "Warrior", "Assassin", "Archer", "Mage", "Priest"]);
  });

  it("defines Global factions from the current live taxonomy", () => {
    expect(labels(globalFactionOptions)).toEqual([
      "Sanctum Glory",
      "Wild Spirit",
      "Elemental Echo",
      "Arcane Wisdom",
      "Otherworld Return",
      "Illusion Veil",
    ]);
    expect(labels(globalFactionOptions)).not.toContain("Eternal Frost");
  });

  it("defines Taiwan factions independently with current official labels", () => {
    expect(labels(taiwanFactionOptions)).toEqual([
      "聖堂榮光",
      "曠野之靈",
      "元素迴響",
      "奧術智慧",
      "彼岸再臨",
      "幻境秘影",
    ]);
    expect(taiwanFactionOptions.map((option) => option.key)).not.toEqual(
      globalFactionOptions.map((option) => option.key),
    );
  });

  it("uses the verified Global rarity taxonomy and rejects old generic labels", () => {
    expect(labels(globalRarityOptions)).toEqual(["SSR EX", "SSR+", "SSR", "SR", "R", "N"]);
    expect(labels(globalRarityOptions)).not.toEqual(
      expect.arrayContaining(["Mythic", "Legendary", "Epic"]),
    );
  });

  it("keeps Taiwan rarity labels server-native instead of translating Global labels", () => {
    expect(labels(taiwanRarityOptions)).toEqual(["傳說·神話", "傳說+", "傳說", "史詩"]);
    expect(labels(taiwanRarityOptions)).not.toEqual(
      expect.arrayContaining(["Mythic", "Legendary", "Epic"]),
    );
  });

  it.each([globalSnapshot, taiwanSnapshot] as readonly ServerSnapshot[])(
    "$label snapshot only references its own faction and rarity taxonomy",
    (snapshot) => {
      const factionKeys = new Set(snapshot.factions.map((option) => option.key));
      const rarityKeys = new Set(snapshot.rarities.map((option) => option.key));

      for (const luminary of snapshot.luminaries) {
        expect(rarityKeys.has(luminary.rarityKey)).toBe(true);
        expect(luminary.factionKeys.length).toBeGreaterThan(0);
        for (const faction of luminary.factionKeys) {
          expect(factionKeys.has(faction)).toBe(true);
        }
        expect(["S+", "S", "A", "B", "C"]).toContain(luminary.rankings.overall);
        expect(["S+", "S", "A", "B", "C"]).toContain(luminary.rankings.pve);
        expect(["S+", "S", "A", "B", "C"]).toContain(luminary.rankings.pvp);
      }
    },
  );
});
