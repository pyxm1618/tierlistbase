import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import {
  loadGenshinData,
  GenshinChanges,
  GenshinEditorial,
  GenshinTierBoard,
  genshinHero as hero,
  genshinStyles as styles,
} from "@/modules/genshin-tier-list";
import { currentSeoEnvironment } from "@/platform/seo/environment-policy";
import { metadataForRoute } from "@/platform/seo/metadata";
import { webApplicationJsonLd } from "@/platform/seo/structured-data";

export async function generateMetadata(): Promise<Metadata> {
  return metadataForRoute(routeRegistry, "/genshin-impact/tier-list", currentSeoEnvironment());
}

export const dynamic = "force-dynamic";

export default async function GenshinImpactTierListPage() {
  const result = await loadGenshinData();
  if (result.status === "unavailable")
    return (
      <main className={styles.page}>
        <div className={styles.shell}>
          <h1>Genshin Tier List</h1>
          <p role="status">
            Reviewed ranking data is currently unavailable. Please try again later.
          </p>
        </div>
      </main>
    );
  const { data } = result;
  return (
    <main className={styles.page}>
      <JsonLd
        value={webApplicationJsonLd({
          name: "Genshin Tier List",
          url: `${routeRegistry.site.canonicalOrigin}/genshin-impact/tier-list`,
          description:
            "Current Genshin Impact character rankings with tier explanations, ranking evidence, and version changes.",
        })}
      />
      <header className={styles.hero} data-ia-section="page-header">
        <Image
          src={hero}
          alt=""
          fill
          priority
          sizes="(max-width: 1820px) 100vw, 1820px"
          className={styles.heroImage}
        />
        <div className={styles.heroShade} />
        <div className={styles.shell}>
          <nav className={styles.breadcrumbs} aria-label="Breadcrumb">
            <Link href="/">Home</Link>
            <span aria-hidden="true">›</span>
            <span>Genshin Impact</span>
            <span aria-hidden="true">›</span>
            <span>Tier List</span>
          </nav>
          <div className={styles.heroGrid}>
            <div className={styles.titleGroup}>
              <div className={styles.gameBadge}>
                <span aria-hidden="true">✦</span>
                <strong>
                  Genshin
                  <br />
                  Impact
                </strong>
              </div>
              <div>
                <h1>Genshin Tier List</h1>
                <p>Current Version · Endgame Overall Character Rankings</p>
                <p className={styles.subtitle}>
                  This Genshin Tier List ranks current characters for endgame play under shared assumptions,
                  with clear tier explanations and documented evidence.
                </p>
              </div>
            </div>
            <section
              className={styles.context}
              data-ia-section="ranking-context"
              aria-label="Ranking Context"
            >
              <div>
                <span>Current Version</span>
                <strong>{data.version}</strong>
              </div>
              <div>
                <span>Ranking Data Updated</span>
                <strong>
                  <time dateTime={data.updatedAt}>{data.updatedAt.slice(0, 10)}</time>
                </strong>
              </div>
              <div>
                <span>Ranking Context</span>
                <strong>Endgame Overall</strong>
              </div>
              <div>
                <span>5★ Baseline</span>
                <strong>C0 / No Signature Weapon</strong>
              </div>
              <div>
                <span>4★ Baseline</span>
                <strong>C6 / Accessible 4★ Weapon</strong>
              </div>
              <div>
                <span>Main Reference Content</span>
                <strong>See character Best-use Context</strong>
              </div>
            </section>
          </div>
        </div>
      </header>
      <div className={styles.shell}>
        <div className={styles.mockNotice}>
          <strong>Current Genshin Tier List</strong>
          <span>Character rankings reviewed for version {data.version}.</span>
        </div>
        <GenshinTierBoard characters={data.characters} changes={<GenshinChanges data={data} />} />
        <GenshinEditorial data={data} />
      </div>
    </main>
  );
}
