import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

import { gamesConfig, navigationGames } from "@/config/games.config";

describe("games.config registry", () => {
  it("registers released game routes without changing the existing navigation set", () => {
    expect(gamesConfig).toHaveLength(8);
    expect(gamesConfig.map((g) => g.name)).toEqual([
      "World of Warcraft",
      "Genshin Impact",
      "Zenless Zone Zero",
      "NIKKE",
      "Limbus Company",
      "Phantom Blade Zero",
      "Dragon Traveler",
      "Wild Rift",
    ]);

    expect(gamesConfig.map((g) => g.tierListHref)).toEqual([
      "/wow-forever/tier-list",
      "/genshin-impact/tier-list",
      "/zenless-zone-zero/tier-list",
      "/nikke/tier-list",
      "/limbus-company/tier-list",
      "/phantom-blade-zero/tier-list",
      "/dragon-traveler/tier-list",
      "/wild-rift/tier-list",
    ]);

    expect(gamesConfig.map((g) => g.navigationOrder)).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
  });

  it("exports navigationGames matching the visible games in navigation order", () => {
    expect(gamesConfig.find((game) => game.slug === "dragon-traveler")?.navigationVisible).toBe(
      false,
    );
    expect(gamesConfig.find((game) => game.slug === "wild-rift")?.navigationVisible).toBe(false);
    expect(navigationGames).toHaveLength(6);
    expect(navigationGames.every((g) => g.navigationVisible)).toBe(true);
    expect(navigationGames.map((g) => g.slug)).toEqual([
      "wow-forever",
      "genshin-impact",
      "zenless-zone-zero",
      "nikke",
      "limbus-company",
      "phantom-blade-zero",
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
    expect(siteHeaderSource).not.toContain("SiteHeaderVariant");
    expect(siteHeaderSource).not.toContain("site-header-variant");
  });
});
