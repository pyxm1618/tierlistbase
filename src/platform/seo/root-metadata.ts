import type { Metadata } from "next";

import { seoConfig } from "@/config/seo.config";
import { currentSeoEnvironment, metadataOrigin } from "@/platform/seo/environment-policy";

export function rootMetadata(): Metadata {
  const mode = currentSeoEnvironment();
  const appOrigin = process.env.APP_ORIGIN;

  return {
    metadataBase: metadataOrigin({
      mode,
      ...(appOrigin ? { appOrigin } : {}),
      canonicalOrigin: seoConfig.canonicalOrigin,
    }),
    title: {
      default: seoConfig.defaultTitle,
      template: seoConfig.titleTemplate,
    },
    description: seoConfig.defaultDescription,
    icons: {
      icon: [
        { url: "/favicon.ico", type: "image/x-icon", sizes: "any" },
        { url: "/favicon-16x16.png", type: "image/png", sizes: "16x16" },
        { url: "/favicon-32x32.png", type: "image/png", sizes: "32x32" },
      ],
      apple: [{ url: "/apple-touch-icon.png", type: "image/png", sizes: "180x180" }],
    },
    manifest: "/manifest.webmanifest",
  };
}
