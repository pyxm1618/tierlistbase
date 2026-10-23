"use client";

import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./site-header-variant.module.css";

export function LimbusHeader({ brand, account }: { brand: ReactNode; account?: ReactNode }) {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        {brand}
        <nav className={styles.navigation} aria-label="Primary navigation">
          <Link href="/#explore">Games</Link>
          <Link href="/#popular-rankings">Tier Lists</Link>
          <span aria-disabled="true" title="Guides are not available in this preview">
            Guides
          </span>
          <span aria-disabled="true" title="Tools are not available in this preview">
            Tools
          </span>
        </nav>
        <div className={styles.controls} aria-label="Header controls">
          {account}
          <button
            type="button"
            disabled
            aria-label="Search"
            title="Site search is not available in this preview"
            className={styles.search}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="10.5" cy="10.5" r="6.5" />
              <path d="m16 16 5 5" />
            </svg>
            <span>Search</span>
          </button>
          <span lang="en" title="English">
            EN
          </span>
          <button
            type="button"
            disabled
            aria-label="Theme"
            title="Theme follows your device settings"
            className={styles.theme}
          >
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
}
