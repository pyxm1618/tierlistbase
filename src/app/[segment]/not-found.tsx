import Link from "next/link";

import { SupportStatePage } from "@/components/support/status-page";
import styles from "@/components/support/status-page.module.css";

export default function NotFound() {
  return (
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
  );
}
