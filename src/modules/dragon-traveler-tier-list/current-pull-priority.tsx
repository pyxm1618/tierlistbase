"use client";

import { useEffect, useState } from "react";

import { currentBannerAt, verifiedBanners } from "./banners";
import styles from "./dragon-traveler-tier-list.module.css";
import type { ServerKey } from "./data";

export function CurrentPullPriority({ server }: { server: ServerKey }) {
  // A static build must never freeze an active recommendation past its end date.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let boundaryTimer: ReturnType<typeof setTimeout> | undefined;
    function refresh() {
      clearTimeout(boundaryTimer);
      const currentTime = Date.now();
      setNow(currentTime);
      // Track both servers' boundaries once; switching server must not trigger
      // a second synchronous card commit after the page's selection update.
      const nextBoundary = verifiedBanners
        .flatMap((banner) => [Date.parse(banner.startsAt), Date.parse(banner.endsAt)])
        .filter((boundary) => boundary > currentTime)
        .sort((left, right) => left - right)[0];
      if (nextBoundary !== undefined) {
        boundaryTimer = setTimeout(refresh, Math.min(nextBoundary - currentTime, 2_147_483_647));
      }
    }
    refresh();
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      clearTimeout(boundaryTimer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const banner = now === null ? null : currentBannerAt(server, now);

  return (
    <article className={styles.paper} data-current-pull-priority>
      <h3>Current Pull Priority</h3>
      {banner ? (
        <>
          <h4>
            {banner.recommendation} · {banner.bannerName}
          </h4>
          <p>{banner.rationale}</p>
          <p>{banner.windowLabel}</p>
          <small>
            <a href={banner.sourceUrl} target="_blank" rel="noreferrer">
              Official banner notice
            </a>
            {" · "}
            <a href={banner.evaluationSourceUrl} target="_blank" rel="noreferrer">
              Evaluation source
            </a>
            {" · "}Checked {banner.checkedAt}
          </small>
        </>
      ) : (
        <>
          <h4>No verified current banner recommendation</h4>
          <p>
            No verified banner is active in the recorded {server === "global" ? "Global" : "Taiwan"}{" "}
            event window.
          </p>
          <small>Banner evidence checked 2026-10-28</small>
        </>
      )}
    </article>
  );
}
