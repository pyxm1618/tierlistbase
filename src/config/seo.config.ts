import { siteConfig } from "@/config/site.config";
import type { SiteSeoConfig } from "@/platform/seo/types";

export const seoConfig = {
  siteName: siteConfig.name,
  canonicalOrigin: siteConfig.canonicalOrigin,
  defaultLocale: siteConfig.defaultLocale,
  supportedLocales: siteConfig.supportedLocales,
  localeLabels: siteConfig.localeLabels,
  localePrefixStrategy: siteConfig.localePrefixStrategy,
  defaultTitle: "TierListBase",
  titleTemplate: "%s | TierListBase",
  defaultDescription:
    "The evidence-based Game Meta Board for World of Warcraft: Forever. Multi-source consensus, patch tracking, and transparent tier changes.",
  defaultOgImage: "/og/default.svg",
  releaseStatus: "draft",
} as const satisfies SiteSeoConfig;
