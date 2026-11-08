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
const desktopGamesTrigger =
  "flex cursor-pointer list-none items-center gap-1 rounded-sm px-2 py-2 text-[.82rem] font-medium text-slate-100 transition hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 marker:content-none";
const desktopGameLink =
  "rounded-md px-3 py-2 text-sm font-medium text-slate-100 transition hover:bg-[#0b2a46] hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400";
const mobileGamesTrigger =
  "flex cursor-pointer list-none items-center justify-between rounded-sm px-2 py-2 text-[.82rem] font-medium text-slate-100 transition hover:text-amber-300 focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber-400 marker:content-none";

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

function GamesMenuLinks({
  locale,
  className,
}: Readonly<{
  locale: string;
  className: string;
}>) {
  return navigationGames.map((game) => (
    <SiteHeaderGameLink
      key={game.slug}
      href={localePath(siteConfig, locale, game.tierListHref)}
      className={className}
    >
      {game.name}
    </SiteHeaderGameLink>
  ));
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
        <nav className="hidden items-center xl:flex" aria-label="Primary navigation">
          <details className="group relative">
            <summary className={desktopGamesTrigger}>
              Games <span aria-hidden="true">▾</span>
            </summary>
            <div className="absolute left-0 top-full z-50 mt-2 w-[34rem] rounded-lg border border-[#265174] bg-[#061b30] p-4 shadow-xl">
              <div className="mb-2 px-1 text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                Games
              </div>
              <div className="grid grid-cols-2 gap-1">
                <GamesMenuLinks locale={locale} className={desktopGameLink} />
              </div>
            </div>
          </details>
        </nav>
        {desktopAccount ? <div className="ml-auto hidden xl:block">{desktopAccount}</div> : null}
        <details className="group relative ml-auto xl:hidden">
          <summary className="flex cursor-pointer list-none items-center gap-2 rounded-md border border-[#2d5a7e] px-3 py-1.5 text-sm marker:content-none">
            Menu <span aria-hidden="true">☰</span>
          </summary>
          <nav
            aria-label="Mobile navigation"
            className="absolute right-0 top-full mt-2 flex min-w-64 flex-col gap-2 rounded-lg border border-[#265174] bg-[#061b30] p-3 shadow-xl"
          >
            <Link href={homeHref} className={navLink} prefetch={true}>
              Home
            </Link>
            <details>
              <summary className={mobileGamesTrigger}>
                Games <span aria-hidden="true">▾</span>
              </summary>
              <div className="mt-1 grid gap-1 pl-2">
                <GamesMenuLinks locale={locale} className={navLink} />
              </div>
            </details>
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
