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

/**
 * Startup Fame verification badge.
 *
 * Rendered by the marketing layout *after* <SiteFooter /> so the badge is the
 * last visible block on the homepage, and only on the homepage. Non-homepage
 * routes render nothing, so the reciprocal backlink stays homepage-only.
 */
export function StartupFameBadge() {
  const pathname = usePathname();

  if (pathname !== "/") return null;

  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-3 bg-[#020e19] py-3">
      <a href={STARTUP_FAME_HREF} rel="noopener" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- Startup Fame badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Tier List Base - Featured on Startup Fame"
          className="block h-[36px] w-[240px]"
          decoding="async"
          fetchPriority="low"
          height={36}
          loading="lazy"
          src={STARTUP_FAME_BADGE_SRC}
          width={240}
        />
      </a>
      <a href={BETTER_LAUNCH_HREF} rel="noopener" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- Better Launch badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="View Tier List Base on Better Launch"
          className="block h-[56px] w-[200px]"
          decoding="async"
          fetchPriority="low"
          height={56}
          loading="lazy"
          src={BETTER_LAUNCH_BADGE_SRC}
          width={200}
        />
      </a>
      <a href={SHIPSTRY_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- Shipstry badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Featured on Shipstry"
          className="block h-[52px] w-[220px]"
          decoding="async"
          fetchPriority="low"
          height={52}
          loading="lazy"
          src={SHIPSTRY_BADGE_SRC}
          width={220}
        />
      </a>
      <a href={STARTUPBASE_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- StartupBase badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Launched on StartupBase"
          className="block h-[55px] w-[206.25px]"
          decoding="async"
          fetchPriority="low"
          height={55}
          loading="lazy"
          src={STARTUPBASE_BADGE_SRC}
          width={206.25}
        />
      </a>
      <a href={FINDLY_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- Findly.tools badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Featured on Findly.tools"
          className="block h-[55px] w-[173.75px]"
          decoding="async"
          fetchPriority="low"
          height={55}
          loading="lazy"
          src={FINDLY_BADGE_SRC}
          width={173.75}
        />
      </a>
      <a href={FIRST_LOOK_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- First Look badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Featured on First Look"
          className="block h-[55px] w-[200px]"
          decoding="async"
          fetchPriority="low"
          height={55}
          loading="lazy"
          src={FIRST_LOOK_BADGE_SRC}
          width={200}
        />
      </a>
      <a href={TWELVE_TOOLS_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- Twelve Tools badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Featured on Twelve Tools"
          className="block h-[54px] w-[200px]"
          decoding="async"
          fetchPriority="low"
          height={54}
          loading="lazy"
          src={TWELVE_TOOLS_BADGE_SRC}
          width={200}
        />
      </a>
      <a href={CODEHYPE_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- CodeHype badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Featured on CodeHype"
          className="block h-[52px] w-[144px]"
          decoding="async"
          fetchPriority="low"
          height={52}
          loading="lazy"
          src={CODEHYPE_BADGE_SRC}
          width={144}
        />
      </a>
      <a href={BESTSKY_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- BestskyTools badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Featured on BestskyTools"
          className="block h-[52.5px] w-[162.5px]"
          decoding="async"
          fetchPriority="low"
          height={52.5}
          loading="lazy"
          src={BESTSKY_BADGE_SRC}
          width={162.5}
        />
      </a>
    </div>
  );
}
