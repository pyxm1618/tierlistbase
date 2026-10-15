import { describe, expect, it, vi } from "vitest";
import { filterCharacters, tiers } from "@/modules/genshin-tier-list";

vi.mock("server-only", () => ({}));
import { mapGenshinCharacters } from "@/modules/genshin-tier-list/data";
import { reviewedRows } from "../../genshin-tier-list/fixture";
const characters = mapGenshinCharacters(reviewedRows);

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
    const original = characters.map((character) => character.id);
    const filtered = filterCharacters(characters, "", "All", "All");
    for (const tier of tiers) {
      const names = filtered
        .filter((character) => character.tier === tier.name)
        .map((character) => character.name);
      expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b, "en")));
    }
    expect(characters.map((character) => character.id)).toEqual(original);
  });

  it("keeps Traveler as one entity while matching each approved element", () => {
    for (const element of ["Pyro", "Hydro", "Electro", "Cryo", "Anemo", "Geo", "Dendro"] as const)
      expect(filterCharacters(characters, "Traveler", "All", element)).toHaveLength(1);
  });

  it("combines trimmed case-insensitive search with primary role and element", () => {
    expect(
      filterCharacters(characters, "  NAH  ", "Support", "Dendro").map(
        (character) => character.name,
      ),
    ).toEqual(["Nahida"]);
    expect(filterCharacters(characters, "Nahida", "Main DPS", "Dendro")).toEqual([]);
    expect(
      filterCharacters(characters, "", "Support", "Hydro").every(
        (character) =>
          character.primaryRole === "Support" && character.element.split(" / ").includes("Hydro"),
      ),
    ).toBe(true);
    expect(filterCharacters(characters, "no-such-character", "All", "All")).toEqual([]);
  });
});
