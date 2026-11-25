"use client";

import { usePathname } from "next/navigation";

const STARTUP_FAME_HREF = "https://startupfa.me/s/tierlistbase?utm_source=www.tierlistbase.com";
const STARTUP_FAME_BADGE_SRC = "https://startupfa.me/badge?t=small&theme=dark";
const BETTER_LAUNCH_HREF = "https://www.betterlaunch.co/product/tier-list-base";
const BETTER_LAUNCH_BADGE_SRC = "https://www.betterlaunch.co/badge-seen-dark.svg";
const SHIPSTRY_HREF = "https://shipstry.com/";
const SHIPSTRY_BADGE_SRC = "https://shipstry.com/badges/featured.svg";
const STARTUPBASE_HREF =
  "https://startupbase.io/products/tier-list-base?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-dark";
const STARTUPBASE_BADGE_SRC = "https://statics.startupbase.io/site/badges/launched-on-sb-dark.svg";
const FINDLY_HREF = "https://findly.tools/tier-list-base?utm_source=tier-list-base";
const FINDLY_BADGE_SRC = "https://findly.tools/badges/findly-tools-badge-dark.svg";
const FIRST_LOOK_HREF = "https://firstlook.tools";
const FIRST_LOOK_BADGE_SRC = "https://firstlook.tools/badge/badge_dark.svg";
const TWELVE_TOOLS_HREF = "https://twelve.tools";
const TWELVE_TOOLS_BADGE_SRC = "https://twelve.tools/badge2-dark.svg";
const CODEHYPE_HREF = "https://www.codehype.ai/product/tier-list-base?utm_source=codehype_badge";
const CODEHYPE_BADGE_SRC = "https://www.codehype.ai/badges/tier-list-base.svg?variant=find-us&v=20";
const BESTSKY_HREF = "https://bestsky.tools?utm_source=badge";
const BESTSKY_BADGE_SRC = "https://assets.bestsky.tools/badges/featured-light.svg";

const BADGES = [
  {
    href: STARTUP_FAME_HREF,
    rel: "noopener",
    src: STARTUP_FAME_BADGE_SRC,
    alt: "Tier List Base - Featured on Startup Fame",
    className: "block h-[36px] w-[240px]",
    height: 36,
    width: 240,
  },
  {
    href: BETTER_LAUNCH_HREF,
    rel: "noopener",
    src: BETTER_LAUNCH_BADGE_SRC,
    alt: "View Tier List Base on Better Launch",
    className: "block h-[56px] w-[200px]",
    height: 56,
    width: 200,
  },
  {
    href: SHIPSTRY_HREF,
    rel: "noopener noreferrer",
    src: SHIPSTRY_BADGE_SRC,
    alt: "Featured on Shipstry",
    className: "block h-[52px] w-[220px]",
    height: 52,
    width: 220,
  },
  {
    href: STARTUPBASE_HREF,
    rel: "noopener noreferrer",
    src: STARTUPBASE_BADGE_SRC,
    alt: "Launched on StartupBase",
    className: "block h-[55px] w-[206.25px]",
    height: 55,
    width: 206.25,
  },
  {
    href: FINDLY_HREF,
    rel: "noopener noreferrer",
    src: FINDLY_BADGE_SRC,
    alt: "Featured on Findly.tools",
    className: "block h-[55px] w-[173.75px]",
    height: 55,
    width: 173.75,
  },
  {
    href: FIRST_LOOK_HREF,
    rel: "noopener noreferrer",
    src: FIRST_LOOK_BADGE_SRC,
    alt: "Featured on First Look",
    className: "block h-[55px] w-[200px]",
    height: 55,
    width: 200,
  },
  {
    href: TWELVE_TOOLS_HREF,
    rel: "noopener noreferrer",
    src: TWELVE_TOOLS_BADGE_SRC,
    alt: "Featured on Twelve Tools",
    className: "block h-[54px] w-[200px]",
    height: 54,
    width: 200,
  },
  {
    href: CODEHYPE_HREF,
    rel: "noopener noreferrer",
    src: CODEHYPE_BADGE_SRC,
    alt: "Featured on CodeHype",
    className: "block h-[52px] w-[144px]",
    height: 52,
    width: 144,
  },
  {
    href: BESTSKY_HREF,
    rel: "noopener noreferrer",
    src: BESTSKY_BADGE_SRC,
    alt: "Featured on BestskyTools",
    className: "block h-[52.5px] w-[162.5px]",
    height: 52.5,
    width: 162.5,
  },
] as const;

/**
 * Homepage-only reciprocal-link badge rail.
 *
 * Rendered by the marketing layout after <SiteFooter /> so it remains the last
 * visible block on the homepage. The rail is permanently single-row; overflow
 * is presented as a continuous horizontal marquee instead of wrapping.
 */
export function StartupFameBadge() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  const renderBadges = (clone: boolean) =>
    BADGES.map((badge) => (
      <a
        href={badge.href}
        key={badge.href}
        onFocus={
          clone
            ? undefined
            : (event) =>
                event.currentTarget.scrollIntoView({
                  block: "nearest",
                  inline: "nearest",
                })
        }
        rel={badge.rel}
        tabIndex={clone ? -1 : undefined}
        target="_blank"
      >
        {/* eslint-disable-next-line @next/next/no-img-element -- official fixed-size external badge assets intentionally stay as plain img elements */}
        <img
          alt={badge.alt}
          className={badge.className}
          decoding="async"
          fetchPriority="low"
          height={badge.height}
          loading="lazy"
          src={badge.src}
          width={badge.width}
        />
      </a>
    ));

  return (
    <>
      <div className="tlb-badge-marquee-viewport">
        <div className="tlb-badge-marquee-track">
          <div className="tlb-badge-marquee-group">{renderBadges(false)}</div>
          <div aria-hidden="true" className="tlb-badge-marquee-group">
            {renderBadges(true)}
          </div>
          <div aria-hidden="true" className="tlb-badge-marquee-group">
            {renderBadges(true)}
          </div>
        </div>
      </div>
      <style>{`
        .tlb-badge-marquee-viewport {
          width: 100%;
          overflow: hidden;
          background: #020e19;
          padding: 0.75rem 0;
        }

        .tlb-badge-marquee-track {
          display: flex;
          width: max-content;
          animation: tlb-badge-marquee 42s linear infinite;
          will-change: transform;
        }

        .tlb-badge-marquee-group {
          display: flex;
          flex-shrink: 0;
          align-items: center;
          gap: 0.75rem;
          padding-right: 0.75rem;
        }

        .tlb-badge-marquee-group > a {
          flex: 0 0 auto;
        }

        .tlb-badge-marquee-viewport:hover .tlb-badge-marquee-track {
          animation-play-state: paused;
        }

        .tlb-badge-marquee-viewport:focus-within {
          overflow-x: auto;
          scrollbar-width: none;
        }

        .tlb-badge-marquee-viewport:focus-within::-webkit-scrollbar {
          display: none;
        }

        .tlb-badge-marquee-viewport:focus-within .tlb-badge-marquee-track {
          animation: none;
          transform: translate3d(0, 0, 0);
          will-change: auto;
        }

        @keyframes tlb-badge-marquee {
          to {
            transform: translate3d(-33.3333333333%, 0, 0);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .tlb-badge-marquee-viewport {
            overflow-x: auto;
            scrollbar-width: none;
          }

          .tlb-badge-marquee-viewport::-webkit-scrollbar {
            display: none;
          }

          .tlb-badge-marquee-track {
            animation: none;
            will-change: auto;
          }

          .tlb-badge-marquee-group[aria-hidden="true"] {
            display: none;
          }
        }
      `}</style>
    </>
  );
}
