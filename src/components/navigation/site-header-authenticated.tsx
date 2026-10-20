import "server-only";

import { headers } from "next/headers";

import { hasCurrentSession } from "@/platform/auth/current-session";

import { SiteHeaderAccount } from "./site-header-account";
import { SiteHeaderContent, siteHeaderNavLink } from "./site-header-base";

export async function AuthenticatedSiteHeader({ locale }: { locale: string }) {
  const authenticated = await hasCurrentSession(await headers());

  return (
    <SiteHeaderContent
      locale={locale}
      desktopAccount={
        <SiteHeaderAccount authenticated={authenticated} className={siteHeaderNavLink} />
      }
      mobileAccount={
        <SiteHeaderAccount authenticated={authenticated} mobile className={siteHeaderNavLink} />
      }
      variantAccount={
        <SiteHeaderAccount authenticated={authenticated} className={siteHeaderNavLink} />
      }
    />
  );
}
