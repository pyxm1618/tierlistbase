import Link from "next/link";
import type { ReactNode } from "react";

import type { RecentRatingChangeItem } from "@/modules/meta-board";

import { HomeHeroImage } from "./home-hero-image";
import "./game-home.css";

const wowHref = "/wow-forever/tier-list";
const genshinHref = "/genshin-impact/tier-list";
const nikkeHref = "/nikke/tier-list";
const limbusHref = "/limbus-company/tier-list";
const zzzHref = "/zenless-zone-zero/tier-list";

type IconName =
  | "chart"
  | "sliders"
  | "document"
  | "trend"
  | "swords"
  | "shield"
  | "boot"
  | "star"
  | "swirl"
  | "compass"
  | "arrow";

function Icon({ name, size = 34 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, ReactNode> = {
    chart: (
      <>
        <path d="M4 18h5v12H4zM13 10h5v20h-5zM22 3h5v27h-5z" fill="currentColor" stroke="none" />
      </>
    ),
    sliders: (
      <>
        <path d="M3 8h28M3 17h28M3 26h28" />
        <circle cx="12" cy="8" r="3" fill="#041624" />
        <circle cx="23" cy="17" r="3" fill="#041624" />
        <circle cx="15" cy="26" r="3" fill="#041624" />
      </>
    ),
    document: (
      <>
        <path d="M7 3h13l7 7v21H7z" fill="currentColor" stroke="none" />
        <path d="M20 3v8h7M11 17h12M11 22h12M11 27h8" stroke="#052039" />
      </>
    ),
    trend: (
      <>
        <path d="M3 29V18l7-7 6 6L29 4M21 4h8v8M4 30h25" />
        <path d="M6 23v6M13 21v8M20 17v12M27 12v17" />
      </>
    ),
    swords: (
      <>
        <path d="M5 3l11 11m5 5 8 8M28 3L17 14M13 19l-8 8M3 3h7M3 3v7M29 3h-7M29 3v7M3 29h8M29 29h-8" />
      </>
    ),
    shield: (
      <>
        <path d="M16 2l12 5v8c0 8-5 13-12 17C9 28 4 23 4 15V7z" />
        <path d="M16 5v22" />
      </>
    ),
    boot: (
      <>
        <path d="M10 3h12v16l6 3v7H3v-8l7-4z" />
        <path d="M10 11h12M10 16h12" />
      </>
    ),
    star: (
      <>
        <path d="M16 1l4 10 11 5-11 4-4 11-4-11L1 16l11-5zM16 9v14M9 16h14" />
      </>
    ),
    swirl: (
      <>
        <circle cx="16" cy="16" r="13" />
        <path d="M6 16c7-13 24-6 20 5-4 10-17 3-14-3 2-4 9-4 10 1" />
      </>
    ),
    compass: (
      <>
        <path d="M16 2l6 8 10 6-10 6-6 10-6-10-8-6 8-6z" />
        <circle cx="16" cy="16" r="5" />
      </>
    ),
    arrow: (
      <>
        <path d="M5 16h23m-9-9 9 9-9 9" />
      </>
    ),
  };
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 34 34"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth="2.4"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {paths[name]}
    </svg>
  );
}

function SectionTitle({
  children,
  subtitle,
  id,
}: {
  children: ReactNode;
  subtitle: string;
  id: string;
}) {
  return (
    <div className="tlb-section-heading">
      <h2 id={id}>{children}</h2>
      <p>{subtitle}</p>
    </div>
  );
}

function GameCard({ game }: { game: "wow" | "genshin" }) {
  const isWow = game === "wow";
  const title = isWow ? "World of Warcraft" : "Genshin Impact";
  const tags = isWow
    ? ["DPS", "Tanks", "Healers", "PvP", "Leveling"]
    : ["Characters", "Spiral Abyss", "Teams", "Exploration"];
  const content = (
    <>
      <div className="tlb-card-image" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element -- direct-static responsive delivery bypasses /_next/image optimizer */}
        <img
          src={isWow ? "/images/home/wow.webp" : "/images/home/genshin.webp"}
          srcSet={
            isWow
              ? "/images/home/wow-384.webp 384w, /images/home/wow-640.webp 640w, /images/home/wow-768.webp 768w, /images/home/wow-1080.webp 1080w, /images/home/wow-1440.webp 1440w, /images/home/wow.webp 2048w"
              : "/images/home/genshin-384.webp 384w, /images/home/genshin-640.webp 640w, /images/home/genshin-768.webp 768w, /images/home/genshin-1080.webp 1080w, /images/home/genshin-1440.webp 1440w, /images/home/genshin.webp 1774w"
          }
          sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1600px) 46vw, 901px"
          alt=""
          loading="lazy"
          decoding="async"
          className="tlb-cover"
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            inset: 0,
            color: "transparent",
          }}
        />
      </div>
      <div className="tlb-game-card-shade" aria-hidden="true" />
      <div className="tlb-game-content">
        <h3>
          {title}
          <span>Tier List</span>
        </h3>
        <p>
          {isWow
            ? "Explore the current class and specialization meta for World of Warcraft: Forever."
            : "Explore current Genshin Impact character rankings backed by reviewed data."}
        </p>
        <div className="tlb-game-bottom">
          <div className="tlb-tag-list">
            {tags.map((tag) => (
              <span key={tag}>{tag}</span>
            ))}
          </div>
          <span className="tlb-arrow" aria-hidden="true">
            <Icon name="arrow" size={23} />
          </span>
        </div>
      </div>
    </>
  );
  return (
    <Link
      href={isWow ? wowHref : genshinHref}
      prefetch={true}
      className={`tlb-game-card ${isWow ? "tlb-wow" : "tlb-genshin"}`}
      aria-label={
        isWow ? "Explore World of Warcraft: Forever tier list" : "Explore Genshin Impact tier list"
      }
    >
      {content}
    </Link>
  );
}

const benefits: { title: string; description: string; icon: IconName }[] = [
  {
    title: "Clear Rankings",
    description: "See who's strong and who's not at a glance.",
    icon: "chart",
  },
  {
    title: "Multiple Conditions",
    description: "Compare by game mode, role, and more.",
    icon: "sliders",
  },
  {
    title: "Evidence-backed Analysis",
    description: "Trace ranking evidence and supporting sources.",
    icon: "document",
  },
  { title: "Track Changes", description: "See how rankings evolve across patches.", icon: "trend" },
];

const popular: {
  title: string;
  subtitle: string;
  icon: IconName;
  ready: boolean;
  tone: string;
  href?: string;
}[] = [
  {
    title: "WoW",
    subtitle: "DPS",
    icon: "swords",
    ready: true,
    tone: "coral",
    href: wowHref + "?mode=dungeon&role=dps&level=30",
  },
  { title: "WoW", subtitle: "PvP", icon: "shield", ready: false, tone: "gold" },
  { title: "WoW", subtitle: "Leveling", icon: "boot", ready: false, tone: "orange" },
  {
    title: "Genshin",
    subtitle: "Characters",
    icon: "star",
    ready: true,
    tone: "ice",
    href: genshinHref,
  },
  {
    title: "NIKKE",
    subtitle: "Characters",
    icon: "star",
    ready: true,
    tone: "ice",
    href: nikkeHref,
  },
  {
    title: "ZZZ",
    subtitle: "Characters",
    icon: "star",
    ready: true,
    tone: "ice",
    href: zzzHref,
  },
  {
    title: "Limbus Company",
    subtitle: "Identities",
    icon: "document",
    ready: true,
    tone: "gold",
    href: limbusHref,
  },
  { title: "Spiral", subtitle: "Abyss", icon: "swirl", ready: false, tone: "blue" },
  { title: "Exploration", subtitle: "", icon: "compass", ready: false, tone: "gold" },
];

function UpdateCard({ update }: { update: RecentRatingChangeItem | undefined }) {
  const isGenshin = update?.gameSlug === "genshin-impact";
  const title = update
    ? update.entityName + ": " + update.previousTier + " → " + update.newTier
    : "No verified update yet";
  const description = update
    ? update.reason || "Verified tier change recorded for " + update.contextLabel + "."
    : "New verified ranking changes will appear here when published.";
  return (
    <article className="tlb-update-card">
      <div
        className={
          "tlb-update-art" +
          (update ? " " + (isGenshin ? "tlb-update-ice" : "tlb-update-fire") : "")
        }
      >
        {update ? (
          /* eslint-disable-next-line @next/next/no-img-element -- direct-static responsive delivery bypasses /_next/image optimizer */
          <img
            src={isGenshin ? "/images/home/genshin.webp" : "/images/home/wow.webp"}
            srcSet={
              isGenshin
                ? "/images/home/genshin-384.webp 384w, /images/home/genshin-640.webp 640w, /images/home/genshin-768.webp 768w, /images/home/genshin-1080.webp 1080w, /images/home/genshin-1440.webp 1440w, /images/home/genshin.webp 1774w"
                : "/images/home/wow-384.webp 384w, /images/home/wow-640.webp 640w, /images/home/wow-768.webp 768w, /images/home/wow-1080.webp 1080w, /images/home/wow-1440.webp 1440w, /images/home/wow.webp 2048w"
            }
            sizes="(max-width: 700px) calc(100vw - 32px), (max-width: 1600px) 31vw, 595px"
            alt=""
            loading="lazy"
            decoding="async"
            className="tlb-cover"
            style={{
              position: "absolute",
              height: "100%",
              width: "100%",
              inset: 0,
              color: "transparent",
            }}
          />
        ) : null}
      </div>
      <div className="tlb-update-body">
        <div className="tlb-update-meta">
          {update ? (
            <span className={isGenshin ? "tlb-label ice" : "tlb-label"}>
              {isGenshin ? "Genshin" : "WoW"}
            </span>
          ) : null}
          <span>
            {update
              ? new Intl.DateTimeFormat("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  timeZone: "UTC",
                }).format(new Date(update.changedAt))
              : "Pending verification"}
          </span>
        </div>
        <h3>{title}</h3>
        <p>{description}</p>
        {update ? (
          <Link
            href={isGenshin ? genshinHref : wowHref}
            className="tlb-small-arrow"
            aria-label={"View " + title}
          >
            <Icon name="arrow" size={17} />
          </Link>
        ) : null}
      </div>
    </article>
  );
}

export function GameHome({ title, updates }: { title: string; updates: RecentRatingChangeItem[] }) {
  return (
    <div className="tlb-home">
      <section className="tlb-hero" aria-labelledby="page-title">
        <div className="tlb-hero-art" aria-hidden="true">
          <HomeHeroImage />
        </div>
        <div className="tlb-hero-overlay" aria-hidden="true" />
        <div className="tlb-shell tlb-hero-inner">
          <h1 id="page-title">
            {title === "Game Meta. Made Clear." ? (
              <>
                Game Meta.
                <br />
                {" Made "}
                <span>Clear.</span>
              </>
            ) : (
              title
            )}
          </h1>
          <p>
            TierListBase helps you explore game tier lists, compare current rankings, and understand
            the evidence behind how characters, classes, and builds move between tiers.
          </p>
        </div>
      </section>

      <div className="tlb-shell tlb-main-content">
        <section className="tlb-section" id="explore" aria-labelledby="explore-title">
          <SectionTitle
            id="explore-title"
            subtitle="Browse current game tier lists and compare character, class, and specialization rankings."
          >
            Explore Tier Lists
          </SectionTitle>
          <div className="tlb-game-grid">
            <GameCard game="wow" />
            <GameCard game="genshin" />
          </div>
        </section>

        <section className="tlb-section" id="why-tierlistbase" aria-labelledby="why-title">
          <SectionTitle
            id="why-title"
            subtitle="Clear, evidence-based and easy to use. Everything you need to understand the current meta."
          >
            Why TierListBase?
          </SectionTitle>
          <div className="tlb-benefit-grid">
            {benefits.map((item) => (
              <article key={item.title} className="tlb-benefit">
                <span className="tlb-benefit-icon">
                  <Icon name={item.icon} />
                </span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="tlb-section" id="latest-updates" aria-labelledby="updates-title">
          <div className="tlb-heading-row">
            <SectionTitle
              id="updates-title"
              subtitle="Stay on top of verified tier list updates and changes."
            >
              Latest Updates
            </SectionTitle>
            <Link className="tlb-all-updates" href="#explore">
              View rankings <Icon name="arrow" size={17} />
            </Link>
          </div>
          <div className="tlb-update-grid">
            {[0, 1, 2].map((index) => (
              <UpdateCard
                key={updates[index]?.id ?? "placeholder-" + index}
                update={updates[index]}
              />
            ))}
          </div>
        </section>

        <section
          className="tlb-section tlb-last-section"
          id="popular-rankings"
          aria-labelledby="popular-title"
        >
          <SectionTitle id="popular-title" subtitle="Hand-picked entry points to game tier lists.">
            Popular Rankings
          </SectionTitle>
          <div className="tlb-popular-grid">
            {popular.map((item) => {
              const contents = (
                <>
                  <span className={"tlb-pop-icon tlb-tone-" + item.tone}>
                    <Icon name={item.icon} />
                  </span>
                  <span className="tlb-pop-label">
                    {item.title}
                    <span>{item.subtitle}</span>
                  </span>
                  <span className="tlb-pop-right" aria-hidden="true">
                    {item.ready ? "→" : "·"}
                  </span>
                </>
              );
              return item.ready && item.href ? (
                <Link
                  key={item.title + item.subtitle}
                  href={item.href}
                  aria-label={"Open " + item.title + " ranking: " + item.subtitle}
                  className="tlb-popular-item"
                >
                  {contents}
                </Link>
              ) : (
                <div
                  key={item.title + item.subtitle}
                  className="tlb-popular-item tlb-popular-soon"
                  title="Coming soon"
                  aria-label={item.title + " " + item.subtitle + ": coming soon"}
                >
                  {contents}
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
