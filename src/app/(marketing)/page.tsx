import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { GameHome } from "@/components/home/game-home";
import { JsonLd } from "@/components/seo/json-ld";
import { getGameContentFreshness } from "@/config/game-content-freshness.server";
import {
  buildRecentlyUpdatedCandidates,
  homepageRatingChangeGameSlugs,
  selectRecentlyUpdatedTierLists,
} from "@/config/home-games.config";
import { routeRegistry } from "@/config/routes.config";
// prettier-ignore
// eslint-disable-next-line creat-web-modules/product-module-boundary
import { getMultiGameRecentRatingChanges, type RecentRatingChangeItem } from "@/modules/meta-board/db/queries";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd, websiteJsonLd } from "@/platform/seo/structured-data";

export const metadata: Metadata = metadataForRoute(routeRegistry, "/", currentSeoEnvironment());

// Homepage uses a small read-only summary, not the complete context/ratings query.
// No cache entry is created for a failed database read.
const getHomeUpdates = unstable_cache(
  () => getMultiGameRecentRatingChanges(homepageRatingChangeGameSlugs, 3),
  ["tierlistbase-home-multi-game-rating-changes-v2"],
  { revalidate: 1800 },
);

export default async function HomePage() {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("home route must be indexable");

  const featuredGames = selectRecentlyUpdatedTierLists(
    buildRecentlyUpdatedCandidates(await getGameContentFreshness()),
  );

  // Started here so the read runs in parallel with the rest of the render, but the
  // page shell never awaits it. The updates block streams in from its own Suspense
  // boundary, so ranking storage latency cannot delay first paint or LCP.
  const updatesPromise = getHomeUpdates().catch((error: unknown) => {
    // Public discovery remains available if ranking storage is unconfigured or unavailable.
    console.error("Homepage ranking updates unavailable", error);
    return [] as RecentRatingChangeItem[];
  });

  return (
    <main>
      <JsonLd
        value={websiteJsonLd({
          name: routeRegistry.site.siteName,
          url: routeRegistry.site.canonicalOrigin,
          description: home.description,
        })}
      />
      <JsonLd
        value={webApplicationJsonLd({
          name: home.title,
          url: routeRegistry.site.canonicalOrigin,
          description: home.description,
        })}
      />
      <GameHome title={home.h1} featuredGames={featuredGames} updates={updatesPromise} />
    </main>
  );
}
