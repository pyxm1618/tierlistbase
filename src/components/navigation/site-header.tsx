import { featuresConfig } from "@/config/features.config";
import { siteConfig } from "@/config/site.config";

import { SiteHeaderContent } from "./site-header-base";

export { Brand } from "./site-header-base";

async function AuthenticatedSiteHeaderLoader({ locale }: { locale: string }) {
  const { AuthenticatedSiteHeader } = await import("./site-header-authenticated");
  return <AuthenticatedSiteHeader locale={locale} />;
}

export function SiteHeader({ locale = siteConfig.defaultLocale }: Readonly<{ locale?: string }>) {
  if (featuresConfig.auth.enabled) return <AuthenticatedSiteHeaderLoader locale={locale} />;
  return <SiteHeaderContent locale={locale} />;
}
