"use client";

import Link from "next/link";

import { SupportStatePage } from "@/components/support/status-page";
import styles from "@/components/support/status-page.module.css";

export default function MarketingError({
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <SupportStatePage
      artwork="/images/support/error-hero.webp"
      titlePrefix="Something Went "
      titleAccent="Wrong"
      description="We couldn't load this page right now. Please try again."
      secondaryDescription="If the problem continues, you can return to the homepage."
      actions={
        <>
          <button className={styles.primaryButton} type="button" onClick={reset}>
            Try Again
          </button>
          <Link className={styles.secondaryButton} href="/">
            Back to Home
          </Link>
        </>
      }
    />
  );
}
