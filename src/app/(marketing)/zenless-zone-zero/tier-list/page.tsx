import type { Metadata } from "next";

import { routeRegistry } from "@/config/routes.config";
import { ZenlessZoneZeroTierList } from "@/modules/zenless-zone-zero-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/zenless-zone-zero/tier-list", currentSeoEnvironment());
}

export default function ZenlessZoneZeroTierListPage() {
  return <ZenlessZoneZeroTierList />;
}
