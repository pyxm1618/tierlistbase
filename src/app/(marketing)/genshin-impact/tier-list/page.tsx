import type { Metadata } from "next";

import { routeRegistry } from "@/config/routes.config";
import {
  MetaBoardHeader,
  SourcesEvidence,
  TierBoard,
  getGameMetaBoardData,
} from "@/modules/meta-board";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";

type PageProps = {
  searchParams: Promise<{
    mode?: string;
    role?: string;
    level?: string;
    build?: string;
  }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/genshin-impact/tier-list", currentSeoEnvironment());
}

export default async function GenshinImpactTierListPage({ searchParams }: PageProps) {
  const { mode, role, level, build } = await searchParams;

  const metaBoardData = await getGameMetaBoardData({
    gameSlug: "genshin-impact",
    ...(mode ? { mode } : {}),
    ...(role ? { role } : {}),
    ...(level ? { levelCap: Number(level) } : {}),
    ...(build ? { build } : {}),
  });

  return (
    <main className="mx-auto w-full max-w-[1680px] px-3 py-5 sm:px-5 sm:py-7 lg:px-8">
      <MetaBoardHeader
        data={metaBoardData}
        eyebrow="Genshin Impact"
        title="Genshin Impact Tier List"
        description="The Genshin Impact tier-list route is live. TierListBase will publish only reviewed rankings and evidence; unavailable ranking data remains explicitly pending."
        contextMetricLabel="Ranking Context"
        contextMetricValue={metaBoardData.activeContext?.label ?? "Pending"}
      />

      <section className="mt-4" aria-label="Genshin Impact Tier List">
        <TierBoard
          key={`${metaBoardData.activeContext?.id ?? "none"}:${metaBoardData.version?.id ?? "none"}`}
          data={metaBoardData}
        >
          <SourcesEvidence data={metaBoardData} />
        </TierBoard>
      </section>
    </main>
  );
}
