import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { gamesConfig, navigationGames } from "@/config/games.config";

describe("games.config registry", () => {
  it("registers released games and the unpublished Dragon preview without reordering navigation", () => {
    expect(gamesConfig).toHaveLength(6);
    expect(gamesConfig.map((g) => g.name)).toEqual([
      "World of Warcraft",
      "Genshin Impact",
      "Zenless Zone Zero",
      "NIKKE",
      "Limbus Company",
      "Dragon Traveler",
    ]);

    expect(gamesConfig.map((g) => g.tierListHref)).toEqual([
      "/wow-forever/tier-list",
      "/genshin-impact/tier-list",
      "/zenless-zone-zero/tier-list",
      "/nikke/tier-list",
      "/limbus-company/tier-list",
      "/dragon-traveler/tier-list",
    ]);

    expect(gamesConfig.map((g) => g.navigationOrder)).toEqual([1, 2, 3, 4, 5, 6]);
    expect(gamesConfig.find((game) => game.slug === "dragon-traveler")?.navigationVisible).toBe(
      false,
    );
  });

  it("exports navigationGames matching the visible games in navigation order", () => {
    expect(navigationGames).toHaveLength(5);
    expect(navigationGames.every((g) => g.navigationVisible)).toBe(true);
    expect(navigationGames.map((g) => g.slug)).toEqual([
      "wow-forever",
      "genshin-impact",
      "zenless-zone-zero",
      "nikke",
      "limbus-company",
    ]);
  });

  it("ensures SiteHeader uses navigationGames registry for both desktop and mobile navigation", () => {
    const siteHeaderSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/components/navigation/site-header.tsx"),
      "utf8",
    );

    expect(siteHeaderSource).toContain('import { navigationGames } from "@/config/games.config"');
    expect(siteHeaderSource).not.toContain('"/wow-forever/tier-list"');
    expect(siteHeaderSource).not.toContain('"/genshin-impact/tier-list"');

    expect(siteHeaderSource).toContain('aria-label="Primary navigation"');
    expect(siteHeaderSource).toContain('aria-label="Mobile navigation"');
    expect(siteHeaderSource).toContain("navigationGames.map");
  });
});
