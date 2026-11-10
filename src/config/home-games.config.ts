import type { GameRegistryEntry } from "./games.config";
import { gamesConfig } from "./games.config";
import { routeRegistry } from "./routes.config";
import type { GameContentFreshness } from "./game-content-freshness.server";

export const HOMEPAGE_GAME_FALLBACK_IMAGE = "/images/home/hero.webp";

const responsiveImageSrcSets: Readonly<Record<string, string>> = {
  "/images/home/hero.webp":
    "/images/home/hero-384.webp 384w, /images/home/hero-640.webp 640w, /images/home/hero-768.webp 768w, /images/home/hero-1080.webp 1080w, /images/home/hero-1536.webp 1536w, /images/home/hero.webp 2048w",
  "/images/home/wow.webp":
    "/images/home/wow-384.webp 384w, /images/home/wow-640.webp 640w, /images/home/wow-768.webp 768w, /images/home/wow-1080.webp 1080w, /images/home/wow-1440.webp 1440w, /images/home/wow.webp 2048w",
  "/images/home/genshin.webp":
    "/images/home/genshin-384.webp 384w, /images/home/genshin-640.webp 640w, /images/home/genshin-768.webp 768w, /images/home/genshin-1080.webp 1080w, /images/home/genshin-1440.webp 1440w, /images/home/genshin.webp 1774w",
};

export type HomepageGamePresentation = {
  readonly slug: string;
  readonly name: string;
  readonly href: string;
  readonly image: string;
  readonly imageSrcSet?: string;
  readonly tags: readonly string[];
};

export type HomepageTierListCard = HomepageGamePresentation & {
  readonly description: string;
  readonly freshnessDate: string;
  readonly navigationOrder: number;
};

export const homepageRatingChangeGameSlugs = gamesConfig.map((game) => game.slug);

function presentationForGame(game: GameRegistryEntry): HomepageGamePresentation {
  const image = game.homepageImage ?? HOMEPAGE_GAME_FALLBACK_IMAGE;
  const imageSrcSet = responsiveImageSrcSets[image];

  return {
    slug: game.slug,
    name: game.name,
    href: game.tierListHref,
    image,
    tags: game.homepageTags,
    ...(imageSrcSet ? { imageSrcSet } : {}),
  };
}

export function getHomepageGamePresentation(slug: string): HomepageGamePresentation | null {
  const game = gamesConfig.find((candidate) => candidate.slug === slug);
  return game ? presentationForGame(game) : null;
}

export function buildRecentlyUpdatedCandidates(
  freshness: readonly GameContentFreshness[],
  games: readonly GameRegistryEntry[] = gamesConfig,
): readonly HomepageTierListCard[] {
  const freshnessBySlug = new Map(freshness.map((item) => [item.slug, item.freshnessDate]));

  return games.flatMap((game) => {
    if (game.tierListStatus !== "active") return [];

    const freshnessDate = freshnessBySlug.get(game.slug);
    if (!freshnessDate) return [];

    const route = routeRegistry.get(game.tierListHref);
    if (route.class !== "public_indexable") {
      throw new Error(`Tier list route must be public indexable: ${game.tierListHref}`);
    }

    return [
      {
        ...presentationForGame(game),
        description: route.description,
        freshnessDate,
        navigationOrder: game.navigationOrder,
      },
    ];
  });
}

export function selectRecentlyUpdatedTierLists(
  candidates: readonly HomepageTierListCard[],
  limit = 2,
): readonly HomepageTierListCard[] {
  return [...candidates]
    .sort((a, b) => {
      const freshnessDelta = Date.parse(b.freshnessDate) - Date.parse(a.freshnessDate);
      return freshnessDelta || a.navigationOrder - b.navigationOrder;
    })
    .slice(0, limit);
}
