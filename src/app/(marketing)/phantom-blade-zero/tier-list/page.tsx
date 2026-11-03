import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { PhantomBladeZeroTierListPage } from "@/modules/phantom-blade-zero-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/phantom-blade-zero/tier-list", currentSeoEnvironment());
}

export default function PhantomBladeZeroTierListRoute() {
  const route = routeRegistry.get("/phantom-blade-zero/tier-list");

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
      <PhantomBladeZeroTierListPage />
    </>
  );
}
