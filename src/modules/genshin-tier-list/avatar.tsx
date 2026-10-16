"use client";

import Image from "next/image";
import { useState } from "react";
import mockAvatar from "./assets/mock-avatar-1914c60a0f.webp";
import styles from "./genshin-tier-list.module.css";

export function CharacterAvatar({
  name,
  avatar,
  detail = false,
}: {
  name: string;
  avatar?: { "128": string; "256": string } | null | undefined;
  detail?: boolean;
}) {
  const [loadFailed, setLoadFailed] = useState(false);
  const src = !loadFailed && avatar ? (detail ? avatar["256"] : avatar["128"]) : null;

  return (
    <span
      className={detail ? styles.detailAvatar : styles.avatar}
      data-avatar={detail ? "detail" : "board"}
    >
      {src ? (
        <Image
          src={src}
          alt={name}
          fill
          sizes={detail ? "96px" : "64px"}
          loading="lazy"
          onError={() => setLoadFailed(true)}
        />
      ) : (
        <>
          <Image src={mockAvatar} alt="" fill sizes="96px" loading="lazy" />
          <span aria-hidden="true" className={styles.initials}>
            {name
              .split(" ")
              .map((word) => word[0])
              .slice(0, 2)
              .join("")}
          </span>
        </>
      )}
    </span>
  );
}
