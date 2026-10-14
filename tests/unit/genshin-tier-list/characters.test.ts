import { describe, expect, it } from "vitest";
import { filterCharacters, mockCharacters, tiers } from "@/modules/genshin-tier-list";

describe("Genshin local board filtering", () => {
  it("retains all ten tiers and sorts each tier by English name without mutating fixtures", () => {
    expect(tiers.map((tier) => tier.name)).toEqual([
      "S",
      "A+",
      "A",
      "B+",
      "B",
      "C",
      "D",
      "E",
      "F",
      "Pending Evaluation",
    ]);
    const original = mockCharacters.map((character) => character.id);
    const filtered = filterCharacters(mockCharacters, "", "All", "All");
    for (const tier of tiers) {
      const names = filtered
        .filter((character) => character.tier === tier.name)
        .map((character) => character.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    }
    expect(mockCharacters.map((character) => character.id)).toEqual(original);
  });

  it("combines trimmed case-insensitive search with primary role and element", () => {
    expect(
      filterCharacters(mockCharacters, "  NAH  ", "Support", "Dendro").map(
        (character) => character.name,
      ),
    ).toEqual(["Nahida"]);
    expect(filterCharacters(mockCharacters, "Nahida", "Main DPS", "Dendro")).toEqual([]);
    expect(
      filterCharacters(mockCharacters, "", "Support", "Hydro").every(
        (character) => character.role === "Support" && character.element === "Hydro",
      ),
    ).toBe(true);
    expect(filterCharacters(mockCharacters, "no-such-character", "All", "All")).toEqual([]);
  });
});
