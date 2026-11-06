import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { SlayTheSpire2TierList } from "@/modules/slay-the-spire-2-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { breadcrumbJsonLd, webApplicationJsonLd } from "@/platform/seo/structured-data";

const route = "/slay-the-spire-2/tier-list";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, route, currentSeoEnvironment());
}

export default function SlayTheSpire2TierListPage() {
  const definition = routeRegistry.get(route);
  const canonicalUrl = `${routeRegistry.site.canonicalOrigin}${route}`;

  return (
    <>
      {definition.class === "public_indexable" ? (
        <>
          <JsonLd
            value={webApplicationJsonLd({
              name: definition.h1,
              url: canonicalUrl,
              description: definition.description,
            })}
          />
          <JsonLd
            value={breadcrumbJsonLd([
              { name: "TierListBase", url: routeRegistry.site.canonicalOrigin },
              { name: "Slay the Spire 2 Tier List", url: canonicalUrl },
            ])}
          />
        </>
      ) : null}
      <SlayTheSpire2TierList />
    </>
  );
}
