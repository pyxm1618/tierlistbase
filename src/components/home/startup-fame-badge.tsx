"use client";

import { usePathname } from "next/navigation";

const STARTUP_FAME_HREF = "https://startupfa.me/s/tierlistbase?utm_source=www.tierlistbase.com";
const STARTUP_FAME_BADGE_SRC = "https://startupfa.me/badge?t=small&theme=dark";
const BETTER_LAUNCH_HREF = "https://www.betterlaunch.co/product/tier-list-base";
const BETTER_LAUNCH_BADGE_SRC = "https://www.betterlaunch.co/badge-seen-dark.svg";
const FAZIER_HREF = "https://fazier.com/launches/www.tierlistbase.com";
const FAZIER_BADGE_SRC =
  "https://fazier.com/api/v1//public/badges/launch_badges.svg?badge_type=launched&theme=dark";
const SHIPSTRY_HREF = "https://shipstry.com/";
const SHIPSTRY_BADGE_SRC = "https://shipstry.com/badges/featured.svg";

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
      <a href={FAZIER_HREF} rel="noopener noreferrer" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- Fazier badge is an official external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Fazier badge"
          className="block h-[36px] w-[120px]"
          decoding="async"
          fetchPriority="low"
          height={36}
          loading="lazy"
          src={FAZIER_BADGE_SRC}
          width={120}
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
    </div>
  );
}
