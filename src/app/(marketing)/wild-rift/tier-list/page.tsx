import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { WildRiftTierList } from "@/modules/wild-rift-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

const route = "/wild-rift/tier-list";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, route, currentSeoEnvironment());
}

export default function WildRiftTierListPage() {
  const definition = routeRegistry.get(route);
  const canonicalUrl = `${routeRegistry.site.canonicalOrigin}${route}`;

  return (
    <>
      {definition.class === "public_indexable" ? (
        <JsonLd
          value={webApplicationJsonLd({
            name: "Wild Rift Tier List",
            url: canonicalUrl,
            description: definition.description,
          })}
        />
      ) : null}
      <WildRiftTierList />
    </>
  );
}
