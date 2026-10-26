import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { NikkeTierListPage } from "@/modules/nikke-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/nikke/tier-list", currentSeoEnvironment());
}

export default function NikkeTierListRoute() {
  const route = routeRegistry.get("/nikke/tier-list");

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
      <NikkeTierListPage />
    </>
  );
}
