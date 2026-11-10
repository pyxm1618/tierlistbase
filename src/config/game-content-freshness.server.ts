import type { GameRegistryEntry } from "./games.config";
import { gamesConfig } from "./games.config";

export type GameContentFreshness = {
  readonly slug: string;
  readonly freshnessDate: string;
};

type FreshnessLoader = () => Promise<string>;

const freshnessLoaders: Readonly<Record<string, FreshnessLoader>> = {
  "zenless-zone-zero": async () =>
    (await import("@/modules/zenless-zone-zero-tier-list/freshness")).contentFreshnessDate,
  "nikke": async () =>
    (await import("@/modules/nikke-tier-list/freshness")).contentFreshnessDate,
  "limbus-company": async () =>
    (await import("@/modules/limbus-tier-list/freshness")).contentFreshnessDate,
  "phantom-blade-zero": async () =>
    (await import("@/modules/phantom-blade-zero-tier-list/freshness")).contentFreshnessDate,
  "dragon-traveler": async () =>
    (await import("@/modules/dragon-traveler-tier-list/freshness")).contentFreshnessDate,
  "wild-rift": async () =>
    (await import("@/modules/wild-rift-tier-list/freshness")).contentFreshnessDate,
  "anime-expeditions": async () =>
    (await import("@/modules/anime-expeditions-tier-list/freshness")).contentFreshnessDate,
  "slay-the-spire-2": async () =>
    (await import("@/modules/slay-the-spire-2-tier-list/freshness")).contentFreshnessDate,
};

function activeGames(games: readonly GameRegistryEntry[]): readonly GameRegistryEntry[] {
  return games.filter((game) => game.tierListStatus === "active");
}

export async function getGameContentFreshness(
  games: readonly GameRegistryEntry[] = gamesConfig,
): Promise<readonly GameContentFreshness[]> {
  const freshness = await Promise.all(
    activeGames(games).map(async (game) => {
      const loadFreshness = freshnessLoaders[game.slug];
      if (!loadFreshness) return null;
      return {
        slug: game.slug,
        freshnessDate: await loadFreshness(),
      };
    }),
  );

  return freshness.filter((item): item is GameContentFreshness => item !== null);
}
