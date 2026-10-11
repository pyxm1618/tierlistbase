import type { Metadata } from "next";

import { routeRegistry } from "@/config/routes.config";
import { GenshinTierList } from "@/modules/genshin-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(
    routeRegistry,
    "/genshin-impact/tier-list",
    currentSeoEnvironment(),
  );
}

export default function GenshinImpactTierListPage() {
  return (
    <main>
      <GenshinTierList />
    </main>
  );
}
