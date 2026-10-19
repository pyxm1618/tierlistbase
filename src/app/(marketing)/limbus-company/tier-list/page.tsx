import type { Metadata } from "next";

import { routeRegistry } from "@/config/routes.config";
import { LimbusTierList } from "@/modules/limbus-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/limbus-company/tier-list", currentSeoEnvironment());
}

export default function LimbusCompanyTierListPage() {
  return <LimbusTierList />;
}
