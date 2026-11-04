import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { DragonTravelerTierListPage } from "@/modules/dragon-traveler-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/dragon-traveler/tier-list", currentSeoEnvironment());
}

export default function DragonTravelerTierListRoute() {
  const route = routeRegistry.get("/dragon-traveler/tier-list");

  return (
    <>
      {route.class === "public_indexable" ? (
        <JsonLd
          value={webApplicationJsonLd({
            name: route.h1,
            url: `${routeRegistry.site.canonicalOrigin}${route.route}`,
            description: route.description,
          })}
        />
      ) : null}
      <DragonTravelerTierListPage />
    </>
  );
}
