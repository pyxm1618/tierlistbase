import type { Metadata } from "next";

import { routeRegistry } from "@/config/routes.config";
import { NikkeTierListPage } from "@/modules/nikke-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/nikke/tier-list", currentSeoEnvironment());
}

export default function NikkeTierListRoute() {
  return <NikkeTierListPage />;
}
