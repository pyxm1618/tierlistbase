import Image from "next/image";
import type { ReactNode } from "react";

import styles from "./status-page.module.css";

export function SupportStatePage({
  artwork,
  titlePrefix,
  titleAccent,
  description,
  secondaryDescription,
  actions,
}: Readonly<{
  artwork: string;
  titlePrefix: string;
  titleAccent: string;
  description: string;
  secondaryDescription?: string;
  actions: ReactNode;
}>) {
  return (
    <main className={styles.page}>
      <div className={styles.artwork} aria-hidden="true">
        <Image
          src={artwork}
          alt=""
          fill
          unoptimized
          preload
          sizes="100vw"
          className={styles.image}
        />
      </div>
      <div className={styles.shade} aria-hidden="true" />
      <section className={styles.content}>
        <h1>
          {titlePrefix}
          <span>{titleAccent}</span>
        </h1>
        <p className={styles.description}>{description}</p>
        {secondaryDescription ? (
          <p className={styles.secondaryDescription}>{secondaryDescription}</p>
        ) : null}
        <div className={styles.actions}>{actions}</div>
      </section>
    </main>
  );
}
