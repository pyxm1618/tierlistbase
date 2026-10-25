import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { ZenlessZoneZeroTierList } from "@/modules/zenless-zone-zero-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/zenless-zone-zero/tier-list", currentSeoEnvironment());
}

export default function ZenlessZoneZeroTierListPage() {
  const route = routeRegistry.get("/zenless-zone-zero/tier-list");
  const canonicalUrl = `${routeRegistry.site.canonicalOrigin}/zenless-zone-zero/tier-list`;

  return (
    <>
      <JsonLd
        value={webApplicationJsonLd({
          name: "ZZZ Tier List",
          url: canonicalUrl,
          description:
            route.description ??
            "Explore the Zenless Zone Zero Tier List with current character rankings, best agents, team-building insights, and pull decisions to guide your investment.",
        })}
      />
      <ZenlessZoneZeroTierList />
    </>
  );
}
