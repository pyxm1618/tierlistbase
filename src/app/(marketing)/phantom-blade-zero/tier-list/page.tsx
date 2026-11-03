import type { Metadata } from "next";

import { routeRegistry } from "@/config/routes.config";
import { PhantomBladeZeroTierListPage } from "@/modules/phantom-blade-zero-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(
    routeRegistry,
    "/phantom-blade-zero/tier-list",
    currentSeoEnvironment(),
  );
}

export default function PhantomBladeZeroTierListRoute() {
  return <PhantomBladeZeroTierListPage />;
}
