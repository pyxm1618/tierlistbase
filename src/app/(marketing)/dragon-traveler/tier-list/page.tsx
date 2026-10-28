import type { Metadata } from "next";

import { routeRegistry } from "@/config/routes.config";
import { DragonTravelerTierList } from "@/modules/dragon-traveler-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

const route = "/dragon-traveler/tier-list";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, route, currentSeoEnvironment());
}

export default function DragonTravelerTierListPage() {
  return <DragonTravelerTierList />;
}
