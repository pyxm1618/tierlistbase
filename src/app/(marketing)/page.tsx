import type { Metadata } from "next";
import { unstable_cache } from "next/cache";

import { GameHome } from "@/components/home/game-home";
import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { getRecentRatingChanges } from "@/modules/meta-board";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd, websiteJsonLd } from "@/platform/seo/structured-data";

export const metadata: Metadata = metadataForRoute(routeRegistry, "/", currentSeoEnvironment());

// Homepage uses a small read-only summary, not the complete context/ratings query.
// No cache entry is created for a failed database read.
const getHomeUpdates = unstable_cache(
  () => getRecentRatingChanges("wow-forever", 3),
  ["tierlistbase-home-wow-rating-changes-v1"],
  { revalidate: 1800 },
);

export default async function HomePage() {
  const home = routeRegistry.get("/");
  if (home.class !== "public_indexable") throw new Error("home route must be indexable");

  let changes: Awaited<ReturnType<typeof getRecentRatingChanges>> = [];
  try {
    changes = await getHomeUpdates();
  } catch (error) {
    // Public discovery remains available if ranking storage is unconfigured or unavailable.
    console.error("Homepage ranking updates unavailable", error);
  }

  return (
    <main>
      <JsonLd
        value={websiteJsonLd({
          name: routeRegistry.site.siteName,
          url: routeRegistry.site.canonicalOrigin,
          description: routeRegistry.site.defaultDescription,
        })}
      />
      <JsonLd
        value={webApplicationJsonLd({
          name: home.title,
          url: routeRegistry.site.canonicalOrigin,
          description: home.description,
        })}
      />
      <GameHome updates={changes} />
    </main>
  );
}
