import type { ServerKey } from "./types";

export type VerifiedBanner = Readonly<{
  server: ServerKey;
  bannerName: string;
  characterIds: readonly string[];
  officialPool: readonly string[];
  startsAt: string;
  endsAt: string;
  recommendation: "Pull" | "Consider" | "Skip" | "Wait for Testing";
  rationale: string;
  sourceUrl: string;
  checkedAt: string;
}>;

export const verifiedBanners: readonly VerifiedBanner[] = [
  {
    server: "taiwan",
    bannerName: "傳說神話召喚",
    characterIds: ["hypnos-tw", "artemis-tw"],
    officialPool: ["睡神", "大地之母", "月神", "捷足之神"],
    startsAt: "2026-10-15T05:00:00+08:00",
    // The official notice's last minute is 04:59; use an exclusive 05:00 boundary.
    endsAt: "2026-10-29T05:00:00+08:00",
    recommendation: "Consider",
    rationale:
      "依帳號缺口考慮修普諾斯或阿爾忒彌斯；這是依本頁台服評估提出的編輯建議，並非官方強度推薦。官方完整可選名單：睡神、大地之母、月神、捷足之神。",
    sourceUrl: "https://news.game-beans.com/jx/sodNotice/20261014/8285.html",
    checkedAt: "2026-10-28",
  },
];

export function currentBannerAt(server: ServerKey, now: number): VerifiedBanner | null {
  if (!Number.isFinite(now)) return null;
  return (
    verifiedBanners.find(
      (banner) =>
        banner.server === server &&
        now >= Date.parse(banner.startsAt) &&
        now < Date.parse(banner.endsAt),
    ) ?? null
  );
}
