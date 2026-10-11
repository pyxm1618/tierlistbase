import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import {
  ChangesFeed,
  MetaBoardHeader,
  QuickInsights,
  EvidenceSummary,
  ExpertDataView,
  SourceOverview,
  MetaBoardFaq,
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
    ...(mode ? { mode } : {}),
    ...(role ? { role } : {}),
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
    <main className="mx-auto w-full max-w-5xl px-6 py-10 sm:px-8">
      <JsonLd
        value={webApplicationJsonLd({
          name: routeDef.title ?? "WoW Forever Tier List",
          url: canonicalUrl,
          ...(routeDef.description ? { description: routeDef.description } : {}),
        })}
      />

      <MetaBoardHeader data={metaBoardData} />

      {/* Tier Board is IMMEDIATELY placed at the top */}
      <section className="mt-6" aria-label="Tier Board">
        <TierBoard
          key={`${metaBoardData.activeContext?.id ?? "none"}:${metaBoardData.version?.id ?? "none"}`}
          data={metaBoardData}
        />
      </section>

      <QuickInsights />

      {/* Auditable What Changed Section */}
      <ChangesFeed changes={recentChanges} />
      <EvidenceSummary data={metaBoardData} />
      <ExpertDataView data={metaBoardData} />
      <SourceOverview data={metaBoardData} />
      <MetaBoardFaq />
    </main>
  );
}
