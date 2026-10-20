import Link from "next/link";

import { featuresConfig } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { localePath } from "@/platform/i18n/routing";

import { SiteHeaderGameLink, SiteHeaderLinkStatus } from "./site-header-game-link";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      prefetch={true}
      aria-label="TierListBase home"
      className="inline-flex shrink-0 items-center gap-2 text-white no-underline has-[[data-navigation-pending=true]]:cursor-progress has-[[data-navigation-pending=true]]:opacity-60"
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- direct-static responsive delivery bypasses /_next/image optimizer */}
      <img
        src="/brand/tierlistbase-mark-b3364d1d87.webp"
        srcSet="/brand/tierlistbase-mark-b3364d1d87.webp 72w, /brand/tierlistbase-mark-2c18ba5849.webp 108w"
        sizes="36px"
        alt=""
        width={36}
        height={34}
        loading="lazy"
        className="shrink-0"
        decoding="async"
      />
      <span className="text-[.95rem] font-extrabold tracking-tight sm:text-[1.05rem]">
        TIERLISTBASE
      </span>
      <SiteHeaderLinkStatus />
    </Link>
  );
}

export function SiteHeader({ locale = siteConfig.defaultLocale }: Readonly<{ locale?: string }>) {
  const homeHref = localePath(siteConfig, locale, "/");
  const wowHref = localePath(siteConfig, locale, "/wow-forever/tier-list");
  const genshinHref = localePath(siteConfig, locale, "/genshin-impact/tier-list");
  const navLink =
    "rounded-sm px-2 py-2 text-[.82rem] font-medium text-slate-100 transition hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400";

  return (
    <header className="sticky top-0 z-40 border-b border-[#315072]/60 bg-[#020e1d]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-[54px] w-[calc(100%_-_32px)] items-center gap-6 px-4 sm:w-[93.4%] max-w-[1820px] sm:px-0">
        <Brand href={homeHref} />
        <nav className="hidden items-center gap-5 sm:flex" aria-label="Primary navigation">
          <SiteHeaderGameLink href={wowHref} className={navLink}>
            World of Warcraft
          </SiteHeaderGameLink>
          <SiteHeaderGameLink href={genshinHref} className={navLink}>
            Genshin Impact
          </SiteHeaderGameLink>
        </nav>
        {featuresConfig.auth.enabled ? (
          <Link className={navLink + " ml-auto hidden sm:block"} href="/sign-in">
            Sign in
          </Link>
        ) : null}
        <details className="group relative ml-auto sm:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-[#2d5a7e] px-3 py-1.5 text-sm marker:content-none">
            Menu <span aria-hidden="true">☰</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-full mt-2 flex min-w-56 flex-col gap-2 rounded-lg border border-[#265174] bg-[#061b30] p-3 shadow-xl"
          >
            <Link href={homeHref} className={navLink} prefetch={true}>
              Home
            </Link>
            <SiteHeaderGameLink href={wowHref} className={navLink}>
              World of Warcraft
            </SiteHeaderGameLink>
            <SiteHeaderGameLink href={genshinHref} className={navLink}>
              Genshin Impact
            </SiteHeaderGameLink>
            {featuresConfig.auth.enabled ? (
              <Link href="/sign-in" className={navLink}>
                Sign in
              </Link>
            ) : null}
          </nav>
        </details>
      </div>
    </header>
  );
}
