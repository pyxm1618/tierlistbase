import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { LimbusTierList } from "@/modules/limbus-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

const route = "/limbus-company/tier-list";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, route, currentSeoEnvironment());
}

export default function LimbusCompanyTierListPage() {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") {
    throw new Error("Limbus Company tier list must be indexable");
  }

  return (
    <>
      <JsonLd
        value={webApplicationJsonLd({
          name: definition.h1,
          url: `${routeRegistry.site.canonicalOrigin}${route}`,
          description: definition.description,
        })}
      />
      <LimbusTierList />
    </>
  );
}
