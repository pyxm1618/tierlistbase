import Image, { type StaticImageData } from "next/image";

import yiSang from "./assets/sinners/yi-sang.png";
import faust from "./assets/sinners/faust.png";
import donQuixote from "./assets/sinners/don-quixote.png";
import ryoshu from "./assets/sinners/ryoshu.png";
import meursault from "./assets/sinners/meursault.png";
import hongLu from "./assets/sinners/hong-lu.png";
import heathcliff from "./assets/sinners/heathcliff.png";
import ishmael from "./assets/sinners/ishmael.png";
import rodion from "./assets/sinners/rodion.png";
import sinclair from "./assets/sinners/sinclair.png";
import outis from "./assets/sinners/outis.png";
import gregor from "./assets/sinners/gregor.png";
import type { SinnerName } from "./data";
import styles from "./limbus-tier-list.module.css";

const sinnerPortraits = {
  "Yi Sang": yiSang,
  Faust: faust,
  "Don Quixote": donQuixote,
  Ryōshū: ryoshu,
  Meursault: meursault,
  "Hong Lu": hongLu,
  Heathcliff: heathcliff,
  Ishmael: ishmael,
  Rodion: rodion,
  Sinclair: sinclair,
  Outis: outis,
  Gregor: gregor,
} satisfies Record<SinnerName, StaticImageData>;

// Match the existing table, 12-column Identity grid, and responsive E.G.O matrix.
const portraitSizes = {
  compact: "30px",
  identity: "(max-width: 1012px) 77px, (max-width: 1568px) calc((100vw - 90px) / 12), 123px",
  ego: "(max-width: 620px) calc((100vw - 76px) / 12), (max-width: 900px) calc((100vw - 88px) / 12), (max-width: 1568px) calc((100vw - 44px) * 0.95 / 2.08 / 12 - 4.67px), 54px",
} as const;

export function SinnerPortrait({
  sinner,
  variant = "compact",
}: {
  sinner: SinnerName;
  variant?: keyof typeof portraitSizes;
}) {
  return (
    <span
      className={[
        styles.assetSlot,
        variant === "identity" ? styles.assetSlotWide : styles.assetSlotCompact,
        styles.sinnerIcon,
      ].join(" ")}
    >
      <Image
        src={sinnerPortraits[sinner]}
        alt={`${sinner} Sinner icon`}
        fill
        sizes={portraitSizes[variant]}
        className={styles.sinnerIconImage}
      />
    </span>
  );
}
