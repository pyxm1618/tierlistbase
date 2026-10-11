import Link from "next/link";

import { featuresConfig } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";
import { localePath } from "@/platform/i18n/routing";

export function Brand({ href = "/" }: { href?: string }) {
  return (
    <Link
      href={href}
      aria-label="TierListBase home"
      className="inline-flex shrink-0 items-center gap-2 text-white no-underline"
    >
      <svg aria-hidden="true" viewBox="0 0 32 28" width="27" height="27" fill="none">
        <path
          d="M2 8l7 5 7-11 7 11 7-5-4 16H6z"
          fill="#ffd568"
          stroke="#f3ab33"
          strokeLinejoin="round"
          strokeWidth="1.5"
        />
        <path d="M7 19h18M10 15l2 3M21 15l-2 3" stroke="#9e5d18" strokeWidth="1.5" />
        <circle cx="3" cy="6" r="2" fill="#ffe59e" />
        <circle cx="16" cy="2" r="2" fill="#ffe59e" />
        <circle cx="29" cy="6" r="2" fill="#ffe59e" />
      </svg>
      <span className="text-[.95rem] font-extrabold tracking-tight sm:text-[1.05rem]">
        TIERLISTBASE
      </span>
    </Link>
  );
}

export function SiteHeader({ locale = siteConfig.defaultLocale }: Readonly<{ locale?: string }>) {
  const homeHref = localePath(siteConfig, locale, "/");
  const wowHref = localePath(siteConfig, locale, "/wow-forever/tier-list");
  const navLink =
    "rounded-sm px-2 py-2 text-[.82rem] font-medium text-slate-100 transition hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400";

  return (
    <header className="sticky top-0 z-40 border-b border-[#315072]/60 bg-[#020e1d]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-[54px] w-[calc(100%_-_32px)] items-center gap-6 px-4 sm:w-[93.4%] max-w-[1820px] sm:px-0">
        <Brand href={homeHref} />
        <nav className="hidden items-center gap-5 sm:flex" aria-label="Primary navigation">
          <Link href={wowHref} className={navLink + " border-b-2 border-amber-400 text-amber-300"}>
            World of Warcraft
          </Link>
          <span
            className="cursor-not-allowed px-2 py-2 text-[.82rem] font-medium text-slate-400"
            aria-label="Genshin Impact coming soon"
          >
            Genshin Impact
          </span>
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
            <Link href={homeHref} className={navLink}>
              Home
            </Link>
            <Link href={wowHref} className={navLink}>
              World of Warcraft
            </Link>
            <span className="px-2 py-2 text-[.82rem] text-slate-400">
              Genshin Impact · Coming soon
            </span>
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
