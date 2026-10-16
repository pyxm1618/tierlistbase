import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

import { siteConfig } from "@/config/site.config";
import { currentSeoEnvironment, seoEnvironmentPolicy } from "@/platform/seo/environment-policy";

import styles from "./about.module.css";

const WOW_HREF = "/wow-forever/tier-list";
const GENSHIN_HREF = "/genshin-impact/tier-list";
const ABOUT_DESCRIPTION =
  "Learn how TierListBase turns game data and evidence into clear, context-aware tier rankings for World of Warcraft: Forever and Genshin Impact.";

export function generateMetadata(): Metadata {
  const policy = seoEnvironmentPolicy(currentSeoEnvironment());
  const canonical = `${siteConfig.canonicalOrigin}/about`;

  return {
    title: { absolute: "About TierListBase" },
    description: ABOUT_DESCRIPTION,
    alternates: policy.emitCanonical ? { canonical } : undefined,
    robots: { index: policy.index, follow: policy.follow },
    openGraph: {
      type: "website",
      title: "About TierListBase",
      description: ABOUT_DESCRIPTION,
      url: policy.emitCanonical ? canonical : undefined,
      siteName: siteConfig.name,
    },
  };
}

type IconName =
  | "chart"
  | "context"
  | "document"
  | "database"
  | "evaluate"
  | "explain"
  | "transparency"
  | "clarity"
  | "refresh";

function Icon({ name }: Readonly<{ name: IconName }>) {
  const paths: Record<IconName, ReactNode> = {
    chart: (
      <>
        <path d="M5 26V17h5v9H5Zm9 0V10h5v16h-5Zm9 0V4h5v22h-5Z" fill="currentColor" />
      </>
    ),
    context: (
      <>
        <path d="M4 9h24M4 16h24M4 23h24" />
        <circle cx="11" cy="9" r="2.5" fill="currentColor" />
        <circle cx="21" cy="16" r="2.5" fill="currentColor" />
        <circle cx="14" cy="23" r="2.5" fill="currentColor" />
      </>
    ),
    document: (
      <>
        <path d="M8 4h11l6 6v18H8V4Z" />
        <path d="M19 4v7h6M12 16h9M12 21h9" />
      </>
    ),
    database: (
      <>
        <ellipse cx="16" cy="7" rx="9" ry="4" />
        <path d="M7 7v9c0 2.2 4 4 9 4s9-1.8 9-4V7M7 16v9c0 2.2 4 4 9 4s9-1.8 9-4v-9" />
      </>
    ),
    evaluate: (
      <>
        <circle cx="16" cy="16" r="9" />
        <path d="m11 16 3.2 3.2L21.5 12M16 3v3M16 26v3M3 16h3M26 16h3" />
      </>
    ),
    explain: (
      <>
        <path d="M6 5h20v18H15l-6 5v-5H6V5Z" />
        <path d="M11 11h10M11 16h7" />
      </>
    ),
    transparency: (
      <>
        <circle cx="14" cy="14" r="8" />
        <path d="m20 20 8 8M14 10v8M10 14h8" />
      </>
    ),
    clarity: (
      <>
        <path d="M10 19c-2-1.8-3-4.2-3-7a9 9 0 0 1 18 0c0 2.8-1 5.2-3 7-1.7 1.6-2.5 2.8-2.5 5h-7c0-2.2-.8-3.4-2.5-5Z" />
        <path d="M12 28h8M16 1v3M3 12H0M32 12h-3M5 3l2 2M27 3l-2 2" />
      </>
    ),
    refresh: (
      <>
        <path d="M27 10V4l-4 4a11 11 0 1 0 2.4 14" />
        <path d="M5 22v6l4-4" />
      </>
    ),
  };

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

const capabilities: ReadonlyArray<{
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    title: "Clear Rankings",
    description:
      "Quickly understand how characters, classes, and specializations perform within the current ranking context.",
    icon: "chart",
  },
  {
    title: "Context Matters",
    description:
      "Rankings are tied to a defined game version, mode, role, and ranking context rather than treated as one universal answer.",
    icon: "context",
  },
  {
    title: "Evidence Behind the Rankings",
    description:
      "Supporting data, sources, assumptions, methodology, and evidence are shown where available.",
    icon: "document",
  },
];

const process: ReadonlyArray<{
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    title: "Gather",
    description:
      "Relevant public game data, reliable sources, and supporting evidence are collected.",
    icon: "database",
  },
  {
    title: "Evaluate",
    description: "Rankings are reviewed within a defined game version and ranking context.",
    icon: "evaluate",
  },
  {
    title: "Explain",
    description:
      "Tier placement is published together with supporting reasoning, evidence, and limitations where applicable.",
    icon: "explain",
  },
];

const principles: ReadonlyArray<{
  title: string;
  description: string;
  icon: IconName;
}> = [
  {
    title: "Transparency",
    description: "Show where rankings come from and what assumptions they use.",
    icon: "transparency",
  },
  {
    title: "Context",
    description: "Keep game versions, modes, roles, and ranking contexts explicit.",
    icon: "context",
  },
  {
    title: "Clarity",
    description: "Turn complex meta information into rankings players can understand quickly.",
    icon: "clarity",
  },
  {
    title: "Continuous Updates",
    description: "Rankings are reviewed as game versions, available evidence, and the meta change.",
    icon: "refresh",
  },
];

function SectionHeading({
  id,
  title,
  description,
}: Readonly<{ id: string; title: string; description?: string }>) {
  return (
    <div className={styles.sectionHeading}>
      <h2 id={id}>{title}</h2>
      {description ? <p>{description}</p> : null}
    </div>
  );
}

export default function AboutPage() {
  return (
    <main className={styles.page}>
      <section className={styles.hero} aria-labelledby="about-title">
        <div className={styles.heroArtwork} aria-hidden="true">
          <Image
            src="/images/support/about-hero.webp"
            alt=""
            fill
            unoptimized
            preload
            sizes="100vw"
            className={styles.heroImage}
          />
        </div>
        <div className={styles.heroShade} aria-hidden="true" />
        <div className={`${styles.shell} ${styles.heroInner}`}>
          <div className={styles.heroCopy}>
            <h1 id="about-title">
              About <span>TierListBase</span>
            </h1>
            <p className={styles.heroKicker}>Clearer game rankings, backed by evidence.</p>
            <p className={styles.heroDescription}>
              TierListBase helps players understand the current game meta through structured
              rankings, transparent methodology, and supporting evidence.
            </p>
          </div>
        </div>
      </section>

      <div className={styles.shell}>
        <section className={styles.section} aria-labelledby="about-does-title">
          <SectionHeading
            id="about-does-title"
            title="What TierListBase Does"
            description="We turn complex game data into clear, practical tier lists."
          />
          <div className={styles.capabilityGrid}>
            {capabilities.map((item) => (
              <article className={styles.infoCard} key={item.title}>
                <span className={styles.icon}>
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-process-title">
          <SectionHeading
            id="about-process-title"
            title="How Rankings Work"
            description="Our ranking process focuses on data, context, and transparency."
          />
          <div className={styles.processGrid}>
            {process.map((item, index) => (
              <article className={styles.processCard} key={item.title}>
                <div className={styles.processHeader}>
                  <span className={styles.stepNumber}>{index + 1}</span>
                  <span className={styles.processIcon}>
                    <Icon name={item.icon} />
                  </span>
                  <h3>{item.title}</h3>
                </div>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-principles-title">
          <SectionHeading
            id="about-principles-title"
            title="Our Principles"
            description="These principles guide how we build and maintain our tier lists."
          />
          <div className={styles.principleGrid}>
            {principles.map((item) => (
              <article className={styles.principleCard} key={item.title}>
                <span className={styles.principleIcon}>
                  <Icon name={item.icon} />
                </span>
                <div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className={styles.section} aria-labelledby="about-games-title">
          <SectionHeading
            id="about-games-title"
            title="Games on TierListBase"
            description="Explore our current game tier lists."
          />
          <div className={styles.gameGrid}>
            <Link className={styles.gameCard} href={WOW_HREF}>
              <Image
                src="/images/home/wow.webp"
                alt=""
                fill
                unoptimized
                sizes="(max-width: 700px) calc(100vw - 32px), 46vw"
                className={styles.gameImage}
              />
              <span className={styles.gameShade} aria-hidden="true" />
              <span className={styles.gameContent}>
                <strong>World of Warcraft: Forever</strong>
                <span>
                  Explore class and specialization rankings for World of Warcraft: Forever.
                </span>
                <span className={styles.gameCta}>View Tier List →</span>
              </span>
            </Link>
            <Link className={`${styles.gameCard} ${styles.genshinCard}`} href={GENSHIN_HREF}>
              <Image
                src="/images/home/genshin.webp"
                alt=""
                fill
                unoptimized
                sizes="(max-width: 700px) calc(100vw - 32px), 46vw"
                className={styles.gameImage}
              />
              <span className={styles.gameShade} aria-hidden="true" />
              <span className={styles.gameContent}>
                <strong>Genshin Impact</strong>
                <span>Explore current character rankings with evidence and tier explanations.</span>
                <span className={styles.gameCta}>View Tier List →</span>
              </span>
            </Link>
          </div>
        </section>

        <section
          className={`${styles.section} ${styles.independent}`}
          aria-labelledby="about-independent-title"
        >
          <SectionHeading id="about-independent-title" title="An Independent Resource" />
          <p className={styles.independentCopy}>
            TierListBase is an independent ranking and analysis resource. Game names, characters,
            artwork, trademarks, and other intellectual property belong to their respective owners.
            TierListBase is not affiliated with or endorsed by the publishers of the games covered
            on this site.
          </p>
        </section>
      </div>
    </main>
  );
}
