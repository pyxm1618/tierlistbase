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
          name: "Zenless Zone Zero Tier List",
          url: canonicalUrl,
          description:
            route.description ??
            "Zenless Zone Zero agent rankings, team rankings, and account-focused pull advice.",
        })}
      />
      <ZenlessZoneZeroTierList />
    </>
  );
}
