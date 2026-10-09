import type { Metadata } from "next";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import {
  ChangesFeed,
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

  const recentChanges = await getRecentRatingChanges("wow-forever", 5);

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

      {/* Immediate Above-the-fold Header: H1, Patch, Build, Level Cap, Freshness */}
      <header className="border-b border-border pb-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-muted">
              Game Meta Board
            </span>
            <h1 className="mt-1 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              WoW Forever Tier List
            </h1>
          </div>

          {/* Patch / Build / Level Cap / Status meta indicators */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            {metaBoardData.version ? (
              <>
                <span className="rounded bg-surface-muted px-2.5 py-1 font-medium text-foreground">
                  Patch {metaBoardData.version.version}
                  {metaBoardData.version.build ? ` (${metaBoardData.version.build})` : ""}
                </span>
                {metaBoardData.version.levelCap ? (
                  <span className="rounded bg-surface-muted px-2.5 py-1 font-medium text-foreground">
                    Level Cap: {metaBoardData.version.levelCap}
                  </span>
                ) : null}
                <span className="rounded bg-emerald-500/10 px-2 py-1 font-medium text-emerald-600 dark:text-emerald-400 capitalize">
                  {metaBoardData.version.status}
                </span>
              </>
            ) : (
              <span className="rounded bg-surface-muted px-2.5 py-1 font-medium text-muted">
                Version Pending Verification
              </span>
            )}
          </div>
        </div>
      </header>

      {/* Tier Board is IMMEDIATELY placed at the top */}
      <section className="mt-6" aria-label="Tier Board">
        <TierBoard data={metaBoardData} />
      </section>

      {/* Auditable What Changed Section */}
      <ChangesFeed changes={recentChanges} />
    </main>
  );
}
