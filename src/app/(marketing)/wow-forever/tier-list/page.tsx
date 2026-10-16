import type { Metadata } from "next";
import Image from "next/image";
import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import { getGameMetaBoardData, getRecentRatingChanges } from "@/modules/meta-board";
import {
  buildWowSpecs,
  summarizeWowStatus,
  WowWorkspace,
  WowRoleLinks,
  WowChanges,
  WowInsights,
  WowMethodology,
  WowSources,
  wowHero as hero,
  wowStyles as styles,
} from "@/modules/meta-board";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

type PageProps = {
  searchParams: Promise<{ role?: string; mode?: string; level?: string; build?: string }>;
};
export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/wow-forever/tier-list", currentSeoEnvironment());
}
export default async function WowForeverTierListPage({ searchParams }: PageProps) {
  const route = routeRegistry.get("/wow-forever/tier-list");
  if (route.class !== "public_indexable") throw new Error("WoW tier list must be indexable");
  const { role } = await searchParams;
  // Dungeon / Level 30 / current stored version are fixed V1 context dimensions.
  const data = await getGameMetaBoardData({
    gameSlug: "wow-forever",
    mode: "dungeon",
    role: role ?? "dps",
    levelCap: 30,
  });
  const changes =
    data.activeContext && data.version
      ? await getRecentRatingChanges("wow-forever", 10, undefined, {
          rankingContextId: data.activeContext.id,
          toVersionId: data.version.id,
        })
      : [];
  const specs = buildWowSpecs(data);
  const status = summarizeWowStatus(data);
  // Conservative publication status also applies to every card and Detail, not only the Hero.
  for (const spec of specs) {
    if (status === "Stale") spec.status = "Stale";
    else if (status === "Preliminary" && spec.status === "Current") spec.status = "Preliminary";
  }
  const retrieved = specs
    .flatMap((spec) => (spec.retrievedAt ? [spec.retrievedAt] : []))
    .sort()
    .at(-1);
  const canonicalUrl = `${routeRegistry.site.canonicalOrigin}/wow-forever/tier-list`;
  return (
    <div className={styles.pageBackground}>
      <main className={styles.page}>
        <JsonLd
          value={webApplicationJsonLd({
            name: route.h1,
            url: canonicalUrl,
            description: route.description,
          })}
        />
        <header className={styles.hero} data-wow-hero>
          <Image
            src={hero}
            alt=""
            fill
            sizes="(max-width: 767px) calc(100vw - 24px), (max-width: 1640px) calc(100vw - 48px), 1592px"
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroContent}>
            <div>
              <h1>{route.h1}</h1>
              <p className={styles.heroSubtitle}>Level 30 Beta · Dungeon DPS / Tank / Healer</p>
              <p>
                This WoW Tier List ranks DPS, Tank and Healer specializations for World of Warcraft:
                Forever using observed dungeon performance data and reviewed evidence. The WoW
                Forever Tier List is limited to selected near-cap dungeons in the current Level 30
                Beta context.
              </p>
            </div>
            <dl className={styles.heroFacts}>
              <div>
                <dt>Recorded Beta Phase / Version</dt>
                <dd>{data.version?.version ?? "Current Beta · verification pending"}</dd>
              </div>
              <div>
                <dt>Level Cap Context</dt>
                <dd>30</dd>
              </div>
              <div>
                <dt>Data Updated · UTC</dt>
                <dd>{retrieved ? retrieved.slice(0, 10) : "No recorded data"}</dd>
              </div>
              <div>
                <dt>Data Status</dt>
                <dd data-status={status}>{status}</dd>
              </div>
            </dl>
          </div>
        </header>
        <section className={styles.context} aria-labelledby="wow-context-heading">
          <h2 id="wow-context-heading">WoW Tier List Ranking Context</h2>
          <p>
            The WoW Tier List context stays fixed to Dungeon, Level 30 Beta and the current WoW
            Forever Beta version.
          </p>
          <dl>
            <div>
              <dt>Mode</dt>
              <dd>Dungeon</dd>
            </div>
            <div>
              <dt>Level Cap</dt>
              <dd>30 Beta</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>Current WoW Forever Beta context</dd>
            </div>
          </dl>
          <WowRoleLinks
            availableRoles={data.availableRoles}
            currentRole={data.activeContext?.role}
          />
        </section>
        <WowWorkspace
          key={`${data.activeContext?.id ?? "none"}:${data.version?.id ?? "none"}`}
          specs={specs}
        >
          <WowInsights specs={specs} changes={changes} />
          <WowChanges changes={changes} />
          <WowSources specs={specs} />
        </WowWorkspace>
        <WowMethodology />
      </main>
    </div>
  );
}
