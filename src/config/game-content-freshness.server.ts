/* eslint-disable creat-web-modules/product-module-boundary -- This server-only adapter reads canonical data-only freshness sources without loading product UI roots into the homepage. */

import type { GameRegistryEntry } from "./games.config";
import { gamesConfig } from "./games.config";

export type GameContentFreshness = {
  readonly slug: string;
  readonly freshnessDate: string;
};

type FreshnessLoader = () => Promise<string>;

const freshnessLoaders: Readonly<Record<string, FreshnessLoader>> = {
  "zenless-zone-zero": async () => {
    const { snapshotDate } = await import("@/modules/zenless-zone-zero-tier-list/data");
    return snapshotDate;
  },
  "limbus-company": async () => {
    const { masterSourceMetadata } = await import("@/modules/limbus-tier-list/data/sources");
    return masterSourceMetadata.reviewedAt;
  },
  "phantom-blade-zero": async () => {
    const { phantomBladeZeroSnapshot } = await import("@/modules/phantom-blade-zero-tier-list/data");
    return phantomBladeZeroSnapshot.snapshotDate;
  },
  "dragon-traveler": async () => {
    const { snapshotDate } = await import("@/modules/dragon-traveler-tier-list/data");
    return snapshotDate;
  },
  "wild-rift": async () => {
    const { snapshot } = await import("@/modules/wild-rift-tier-list/data");
    return snapshot.reviewedAt;
  },
  "anime-expeditions": async () => {
    const { snapshot } = await import("@/modules/anime-expeditions-tier-list/data");
    return snapshot.reviewedAt;
  },
  "slay-the-spire-2": async () => {
    const { snapshot } = await import("@/modules/slay-the-spire-2-tier-list/data");
    return snapshot.lastReviewed;
  },
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
