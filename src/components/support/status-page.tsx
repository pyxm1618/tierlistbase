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
        {/* eslint-disable-next-line @next/next/no-img-element -- the artwork is already
            served unoptimized, and `not-found` is embedded in every marketing page's
            payload: pulling `next/image` in here made the image client chunk a third hop
            on the homepage critical chain for an image no visitor sees first. */}
        <img
          src={artwork}
          alt=""
          decoding="async"
          loading="lazy"
          className={styles.image}
          style={{
            position: "absolute",
            height: "100%",
            width: "100%",
            inset: 0,
            color: "transparent",
          }}
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
