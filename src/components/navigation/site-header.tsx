import { headers } from "next/headers";
import Link from "next/link";
import type { ReactNode } from "react";

import { featuresConfig } from "@/config/features.config";
import { navigationGames } from "@/config/games.config";
import { siteConfig } from "@/config/site.config";
import { readCurrentSessionIdentity } from "@/platform/auth/current-session";
import { localePath } from "@/platform/i18n/routing";

import { SiteHeaderAccount } from "./site-header-account";
import { SiteHeaderGameLink, SiteHeaderLinkStatus } from "./site-header-game-link";

const navLink =
  "whitespace-nowrap rounded-sm px-2 py-2 text-[.82rem] font-medium text-slate-100 transition hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400";
const desktopNavLink =
  "whitespace-nowrap rounded-sm px-1 py-2 text-[.72rem] font-medium text-slate-100 transition hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 2xl:px-2 2xl:text-[.82rem]";

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

function HeaderShell({
  locale,
  desktopAccount,
  mobileAccount,
}: {
  locale: string;
  desktopAccount?: ReactNode;
  mobileAccount?: ReactNode;
}) {
  const homeHref = localePath(siteConfig, locale, "/");

  return (
    <header className="sticky top-0 z-40 border-b border-[#315072]/60 bg-[#020e1d]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-[54px] w-[calc(100%_-_32px)] items-center gap-6 px-4 sm:w-[93.4%] max-w-[1820px] sm:px-0">
        <Brand href={homeHref} />
        <nav className="hidden items-center gap-1 xl:flex 2xl:gap-5" aria-label="Primary navigation">
          {navigationGames.map((game) => (
            <SiteHeaderGameLink
              key={game.slug}
              href={localePath(siteConfig, locale, game.tierListHref)}
              className={desktopNavLink}
            >
              {game.name}
            </SiteHeaderGameLink>
          ))}
        </nav>
        {desktopAccount ? <div className="ml-auto hidden xl:block">{desktopAccount}</div> : null}
        <details className="group relative ml-auto xl:hidden">
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
            {navigationGames.map((game) => (
              <SiteHeaderGameLink
                key={game.slug}
                href={localePath(siteConfig, locale, game.tierListHref)}
                className={navLink}
              >
                {game.name}
              </SiteHeaderGameLink>
            ))}
            {mobileAccount}
          </nav>
        </details>
      </div>
    </header>
  );
}

async function AuthenticatedSiteHeader({ locale }: { locale: string }) {
  const identity = await readCurrentSessionIdentity(await headers());

  return (
    <HeaderShell
      locale={locale}
      desktopAccount={
        <SiteHeaderAccount
          authenticated={Boolean(identity)}
          name={identity?.name ?? null}
          email={identity?.email ?? null}
          className={navLink}
        />
      }
      mobileAccount={
        <SiteHeaderAccount
          authenticated={Boolean(identity)}
          name={identity?.name ?? null}
          email={identity?.email ?? null}
          mobile
          className={navLink}
        />
      }
    />
  );
}

export function SiteHeader({ locale = siteConfig.defaultLocale }: Readonly<{ locale?: string }>) {
  if (!featuresConfig.auth.enabled) return <HeaderShell locale={locale} />;
  return <AuthenticatedSiteHeader locale={locale} />;
}
