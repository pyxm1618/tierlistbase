import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import {
  ChangesFeed,
  MetaBoardFaq,
  MetaBoardHeader,
  QuickInsights,
  SourcesEvidence,
  TierBoard,
  getGameMetaBoardData,
  getRecentRatingChanges,
} from "@/modules/meta-board";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    role?: string;
    level?: string;
    build?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/wow-forever/tier-list", currentSeoEnvironment());
}

export default async function WowForeverTierListPage({ searchParams }: PageProps) {
  const { mode, role, level, build } = await searchParams;

  const metaBoardData = await getGameMetaBoardData({
    gameSlug: "wow-forever",
    mode: mode ?? "dungeon",
    role: role ?? "dps",
    ...(level ? { levelCap: Number(level) } : {}),
    ...(build ? { build } : {}),
  });

  const recentChanges =
    metaBoardData.activeContext && metaBoardData.version
      ? await getRecentRatingChanges("wow-forever", 5, undefined, {
          rankingContextId: metaBoardData.activeContext.id,
          toVersionId: metaBoardData.version.id,
        })
      : [];

  const routeDef = routeRegistry.get("/wow-forever/tier-list");
  const canonicalUrl = `${routeRegistry.site.canonicalOrigin}/wow-forever/tier-list`;

  return (
    <main className="mx-auto w-full max-w-[1680px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <JsonLd
        value={webApplicationJsonLd({
          name: routeDef.title ?? "WoW Forever Tier List",
          url: canonicalUrl,
          ...(routeDef.description ? { description: routeDef.description } : {}),
        })}
      />

      <MetaBoardHeader data={metaBoardData} />

      <section className="mt-4" aria-label="Tier Board">
        <TierBoard
          key={`${metaBoardData.activeContext?.id ?? "none"}:${metaBoardData.version?.id ?? "none"}`}
          data={metaBoardData}
        >
          <QuickInsights />
          <ChangesFeed changes={recentChanges} />
          <SourcesEvidence data={metaBoardData} />
          <MetaBoardFaq />
        </TierBoard>
      </section>
    </main>
  );
}
