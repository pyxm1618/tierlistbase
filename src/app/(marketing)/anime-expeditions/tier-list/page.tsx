import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { AnimeExpeditionsTierList } from "@/modules/anime-expeditions-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

const route = "/anime-expeditions/tier-list";
export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, route, currentSeoEnvironment());
}
export default function AnimeExpeditionsTierListPage() {
  const definition = routeRegistry.get(route);
  return (
    <>
      <JsonLd
        value={webApplicationJsonLd({
          name: "Anime Expeditions Tier List",
          url: `${routeRegistry.site.canonicalOrigin}${route}`,
          description: definition.description ?? "Anime Expeditions ranking research preview.",
        })}
      />
      <AnimeExpeditionsTierList />
    </>
  );
}
