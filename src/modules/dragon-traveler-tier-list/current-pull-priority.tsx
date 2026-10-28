"use client";

import { useEffect, useState } from "react";

import { currentBannerAt, verifiedBanners } from "./banners";
import styles from "./dragon-traveler-tier-list.module.css";
import type { ServerKey } from "./types";

export function CurrentPullPriority({ server }: { server: ServerKey }) {
  // A static build must never freeze an active recommendation past its end date.
  const [now, setNow] = useState<number | null>(null);

  useEffect(() => {
    let boundaryTimer: ReturnType<typeof setTimeout> | undefined;
    function refresh() {
      clearTimeout(boundaryTimer);
      const currentTime = Date.now();
      setNow(currentTime);
      const nextBoundary = verifiedBanners
        .filter((banner) => banner.server === server)
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
  }, [server]);

  const banner = now === null ? null : currentBannerAt(server, now);

  return (
    <article className={styles.card} data-current-pull-priority>
      <span className={styles.decisionType}>Current Pull Priority</span>
      {banner ? (
        <>
          <h3>
            {banner.recommendation} · {banner.bannerName}
          </h3>
          <p>{banner.rationale}</p>
          <p>10/15 05:00–10/29 04:59 (UTC+8)</p>
          <small>
            <a href={banner.sourceUrl} target="_blank" rel="noreferrer">
              Official banner notice
            </a>
            {" · "}Checked {banner.checkedAt}
          </small>
        </>
      ) : (
        <>
          <h3>No verified current banner recommendation</h3>
          <p>
            {server === "global"
              ? "A character rating does not establish a current banner. Confirm the live server notice before spending summon resources."
              : "No verified banner is active in the recorded Taiwan event window."}
          </p>
          <small>Banner evidence checked 2026-10-28</small>
        </>
      )}
    </article>
  );
}
