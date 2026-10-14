import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { JsonLd } from "@/components/seo/json-ld";
import { routeRegistry } from "@/config/routes.config";
import {
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

export default function GenshinImpactTierListPage() {
  return (
    <main className={styles.page}>
      <JsonLd
        value={webApplicationJsonLd({
          name: "Genshin Impact Tier List UI Preview",
          url: `${routeRegistry.site.canonicalOrigin}/genshin-impact/tier-list`,
          description:
            "Mock UI preview for an Endgame Overall tier list. Reviewed rankings are not yet published.",
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
                <h1>Genshin Impact Tier List</h1>
                <p>Current Version · Endgame Overall Tier List</p>
                <p className={styles.subtitle}>
                  Overall character rankings under shared endgame assumptions, with clear reasons
                  and evidence.
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
                <strong>Pending verification</strong>
              </div>
              <div>
                <span>Last Updated</span>
                <strong>Pending verification</strong>
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
                <strong>Pending verification</strong>
              </div>
            </section>
          </div>
        </div>
      </header>
      <div className={styles.shell}>
        <div className={styles.mockNotice}>
          <strong>Mock / Placeholder preview</strong>
          <span>
            No reviewed ranking data published yet. Tiers, roles, rationale, changes and evidence
            are UI fixtures. Avatars are branded placeholders.
          </span>
        </div>
        <GenshinTierBoard changes={<GenshinChanges />} />
        <GenshinEditorial />
      </div>
    </main>
  );
}
