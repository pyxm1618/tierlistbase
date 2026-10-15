import Image from "next/image";
import placeholder from "./assets/neutral-placeholder.webp";
import styles from "./wow-tier-list.module.css";

export function SpecIcon({ detail = false }: { detail?: boolean }) {
  return (
    <span
      className={detail ? styles.detailIcon : styles.icon}
      title="Neutral development placeholder — final visual asset pending"
    >
      <Image
        src={placeholder}
        alt="Neutral placeholder icon"
        width={128}
        height={128}
        className={styles.placeholderImage}
        sizes={detail ? "56px" : "36px"}
        loading="lazy"
      />
      <span className={styles.placeholderMark} aria-hidden="true">
        P
      </span>
    </span>
  );
}
