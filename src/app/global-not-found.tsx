import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/navigation/site-footer";
import { SiteHeader } from "@/components/navigation/site-header";
import { SupportStatePage } from "@/components/support/status-page";
import styles from "@/components/support/status-page.module.css";
import { siteConfig } from "@/config/site.config";

import "./globals.css";

export const metadata: Metadata = {
  title: { absolute: "Page Not Found | TierListBase" },
  description: "The requested TierListBase page could not be found.",
};

export default function GlobalNotFound() {
  return (
    <html lang={siteConfig.defaultLocale}>
      <body>
        <div className={styles.siteFrame}>
          <SiteHeader />
          <SupportStatePage
            artwork="/images/support/404-hero.webp"
            titlePrefix="Page Not "
            titleAccent="Found"
            description="The page you're looking for doesn't exist or may have moved."
            actions={
              <Link className={styles.primaryButton} href="/">
                Back to Home
              </Link>
            }
          />
          <SiteFooter />
        </div>
      </body>
    </html>
  );
}
