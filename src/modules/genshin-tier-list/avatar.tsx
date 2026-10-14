import Image from "next/image";
import mockAvatar from "./assets/mock-avatar-1914c60a0f.webp";
import styles from "./genshin-tier-list.module.css";

export function CharacterAvatar({ name, detail = false }: { name: string; detail?: boolean }) {
  return (
    <span
      className={detail ? styles.detailAvatar : styles.avatar}
      data-avatar={detail ? "detail" : "board"}
    >
      <Image src={mockAvatar} alt="" fill sizes="96px" loading="lazy" />
      <span aria-hidden="true" className={styles.initials}>
        {name
          .split(" ")
          .map((word) => word[0])
          .slice(0, 2)
          .join("")}
      </span>
    </span>
  );
}
