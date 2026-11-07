import type { Metadata } from "next";
import { unstable_cache } from "next/cache";
import Image from "next/image";
import { wowClassFromQuery } from "@/modules/wow-vanguard";
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
  searchParams: Promise<{
    role?: string;
    mode?: string;
    level?: string;
    build?: string;
    class?: string;
  }>;
};

type ValidWowRole = "dps" | "tank" | "healer";

function normalizeWowRole(role: string | undefined): ValidWowRole {
  return role === "tank" || role === "healer" || role === "dps" ? role : "dps";
}

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/wow-forever/tier-list", currentSeoEnvironment());
}
const getWowPageData = unstable_cache(
  async (role: ValidWowRole) => {
    // Dungeon / Level 30 / stored Beta version remain fixed V1 snapshot dimensions.
    const data = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "dungeon",
      role,
      levelCap: 30,
    });
    if (!data.hasData) {
      throw new Error("WoW ranking data unavailable");
    }
    const changes =
      data.activeContext && data.version
        ? await getRecentRatingChanges("wow-forever", 10, undefined, {
            rankingContextId: data.activeContext.id,
            toVersionId: data.version.id,
          })
        : [];
    return { data, changes };
  },
  ["tierlistbase-wow-page-data-v1"],
  { revalidate: 30 },
);

export default async function WowForeverTierListPage({ searchParams }: PageProps) {
  const route = routeRegistry.get("/wow-forever/tier-list");
  if (route.class !== "public_indexable") throw new Error("WoW tier list must be indexable");
  const { role, class: classQuery } = await searchParams;
  const selectedClass = wowClassFromQuery(classQuery);
  const targetRole = normalizeWowRole(role);

  let pageData: Awaited<ReturnType<typeof getWowPageData>>;
  try {
    pageData = await getWowPageData(targetRole);
  } catch {
    return (
      <div className={styles.pageBackground}>
        <main className={styles.page}>
          <section className={styles.context} aria-labelledby="wow-unavailable-heading">
            <h1 id="wow-unavailable-heading">{route.h1}</h1>
            <p role="status">WoW ranking data is currently unavailable. Please try again later.</p>
          </section>
        </main>
      </div>
    );
  }

  const { data, changes } = pageData;
  const specs = buildWowSpecs(data);
  const status = summarizeWowStatus(data, undefined, specs);
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
            quality={85}
            sizes="(max-width: 767px) calc(100vw - 24px), (max-width: 1640px) calc(100vw - 48px), 1592px"
            priority
            className={styles.heroImage}
          />
          <div className={styles.heroContent}>
            <div>
              <h1>{route.h1}</h1>
              <p className={styles.heroSubtitle}>
                Archived Level 30 Beta Snapshot · Dungeon DPS / Tank / Healer
              </p>
              <p>
                This WoW Tier List preserves the reviewed Level 30 Beta dungeon snapshot for DPS,
                Tank and Healer specializations in World of Warcraft: Forever. It is an archived WoW
                Forever Tier List, not a current live ranking. For readers comparing a WoW DPS Tier
                List, the scores below describe Beta-era dungeon observations only.
              </p>
            </div>
            <dl className={styles.heroFacts}>
              <div>
                <dt>Archived Beta Phase / Version</dt>
                <dd>{data.version?.version ?? "Beta snapshot · verification pending"}</dd>
              </div>
              <div>
                <dt>Level Cap Context</dt>
                <dd>30</dd>
              </div>
              <div>
                <dt>Data Captured · UTC</dt>
                <dd>{retrieved ? retrieved.slice(0, 10) : "No recorded data"}</dd>
              </div>
              <div>
                <dt>Snapshot Evidence Status</dt>
                <dd data-status={status}>{status}</dd>
              </div>
            </dl>
          </div>
        </header>
        <section className={styles.context} aria-labelledby="wow-context-heading">
          <h2 id="wow-context-heading">Ranking Context</h2>
          <p>
            This WoW Tier List is fixed to the archived Dungeon, Level 30 Beta snapshot captured
            before launch. The rankings and evidence below describe the Beta environment and must
            not be interpreted as current WoW Forever rankings.
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
              <dd>Archived WoW Forever Beta snapshot</dd>
            </div>
          </dl>
          <WowRoleLinks
            availableRoles={data.availableRoles}
            currentRole={data.activeContext?.role}
            className={selectedClass ?? undefined}
          />
        </section>
        <WowWorkspace
          key={`${data.activeContext?.id ?? "none"}:${data.version?.id ?? "none"}:${selectedClass ?? "all"}`}
          initialClass={selectedClass ?? undefined}
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
