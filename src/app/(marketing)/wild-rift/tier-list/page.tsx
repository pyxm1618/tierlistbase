import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { WildRiftTierList } from "@/modules/wild-rift-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

const route = routeRegistry.get("/wild-rift/tier-list");
const environment = currentSeoEnvironment();

export function generateMetadata(): Metadata {
  return metadataForRoute(routeRegistry, route.route, environment);
}

export default function WildRiftTierListPage() {
  if (route.class !== "public_indexable") {
    throw new Error("Wild Rift Tier List route must remain public_indexable.");
  }

  const canonical = new URL(
    route.canonical ?? route.route,
    routeRegistry.site.canonicalOrigin,
  ).toString();

  return (
    <>
      <JsonLd
        value={webApplicationJsonLd({
          name: "Wild Rift Tier List",
          url: canonical,
          description: route.description,
        })}
      />
      <WildRiftTierList />
    </>
  );
}
