import Image from "next/image";

import styles from "./limbus-tier-list.module.css";

/**
 * 槽位取图宽度：48w 覆盖 23–38px 槽位在 DPR 1，96w 覆盖 DPR 2。
 * 刻意不传 `sizes`：传了会让 Next 输出 16 条 srcSet，大幅膨胀 HTML。
 */
const SLOT_ART_SIZE = 48;

export type AssetSlotProps = {
  /** 已解析的同源图片 URL；缺省时保留原有占位符（不模糊匹配、不静默替换）。 */
  src?: string | undefined;
  /** 相邻已有同名可见文本时传 ""，纯图标条则传资产名。 */
  alt?: string;
  label?: string;
  compact?: boolean;
  wide?: boolean;
};

/**
 * Identity / E.G.O 素材槽位。
 *
 * wrapper 始终沿用 `assetSlot` + `assetSlotCompact|assetSlotWide`，
 * 有真实图片时只额外叠加 `sinnerIcon`（关掉斜纹红叉并换成实底），
 * 因此 38px / 82x94 / wide 等既有尺寸与布局完全不变。
 */
export function AssetSlot({
  src,
  alt = "",
  label = "ART",
  compact = false,
  wide = false,
}: AssetSlotProps) {
  const className = [
    styles.assetSlot,
    compact ? styles.assetSlotCompact : "",
    wide ? styles.assetSlotWide : "",
    src ? styles.sinnerIcon : "",
  ]
    .filter(Boolean)
    .join(" ");

  if (!src) {
    return (
      <span
        className={className}
        aria-label="Artwork asset required"
        title="Artwork asset required"
      >
        <span>{label}</span>
      </span>
    );
  }

  return (
    <span className={className}>
      <Image
        src={src}
        alt={alt}
        width={SLOT_ART_SIZE}
        height={SLOT_ART_SIZE}
        loading="lazy"
        className={styles.sinnerIconImage}
      />
    </span>
  );
}
