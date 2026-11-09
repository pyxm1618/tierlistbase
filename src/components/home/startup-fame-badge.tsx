"use client";

import { usePathname } from "next/navigation";

const STARTUP_FAME_HREF = "https://startupfa.me/s/tierlistbase?utm_source=www.tierlistbase.com";
const STARTUP_FAME_BADGE_SRC = "https://startupfa.me/badges/featured-badge-small.webp";

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
    <div className="flex w-full justify-center bg-[#020e19] py-3">
      <a href={STARTUP_FAME_HREF} rel="noopener" target="_blank">
        {/* eslint-disable-next-line @next/next/no-img-element -- Startup Fame badge is an official fixed-size external asset; next/image remotePatterns is intentionally not used */}
        <img
          alt="Tier List Base - Featured on Startup Fame"
          className="block h-[36px] w-[224px]"
          height={36}
          loading="lazy"
          src={STARTUP_FAME_BADGE_SRC}
          width={224}
        />
      </a>
    </div>
  );
}
