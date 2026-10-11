import type { ProductConfig } from "@/platform/config/types";

export const siteConfig = {
  slug: "tierlistbase",
  name: "TierListBase",
  canonicalOrigin: "https://www.tierlistbase.com",
  defaultLocale: "en",
  supportedLocales: ["en"],
  localeLabels: { en: "English" },
  localePrefixStrategy: "as-needed",
} as const satisfies ProductConfig["site"];
