import type { ServerKey } from "./data";

export type VerifiedBanner = Readonly<{
  server: ServerKey;
  bannerName: string;
  characterIds: readonly string[];
  officialPool: readonly string[];
  startsAt: string;
  endsAt: string;
  windowLabel: string;
  recommendation: "Pull" | "Consider" | "Skip" | "Wait for Testing";
  rationale: string;
  sourceUrl: string;
  evaluationSourceUrl: string;
  checkedAt: string;
}>;

export const verifiedBanners: readonly VerifiedBanner[] = [
  {
    server: "global",
    bannerName: "Limited Summon — Fatespinner Matriarch Arachne",
    characterIds: ["arachne"],
    officialPool: ["Fatespinner Matriarch - Arachne"],
    startsAt: "2026-10-22T05:00:00-05:00",
    endsAt: "2026-11-05T05:00:00-05:00",
    windowLabel: "10/22 05:00–11/5 04:59 (UTC−5)",
    recommendation: "Consider",
    rationale:
      "AllClash currently rates Arachne S for both PvE and PvP and describes a reliance on other Punishment characters. Consider her when that synergy fits your roster. This is editorial advice, not an official strength rating or a universal pull recommendation.",
    sourceUrl: "https://news.game-tree.com/jx/dtofficialnewsen/20261021/1237.html",
    evaluationSourceUrl:
      "https://www.allclash.com/best-characters-in-dragon-traveler-global-tier-list/",
    checkedAt: "2026-10-28",
  },
  {
    server: "taiwan",
    bannerName: "傳說神話召喚",
    characterIds: ["hypnos", "artemis"],
    officialPool: ["睡神", "大地之母", "月神", "捷足之神"],
    startsAt: "2026-10-15T05:00:00+08:00",
    // The official notice's last minute is 04:59; use an exclusive 05:00 boundary.
    endsAt: "2026-10-29T05:00:00+08:00",
    windowLabel: "10/15 05:00–10/29 04:59 (UTC+8)",
    recommendation: "Consider",
    rationale:
      "依帳號缺口考慮修普諾斯或阿爾忒彌斯；這是依本頁台服評估提出的編輯建議，並非官方強度推薦。官方完整可選名單：睡神、大地之母、月神、捷足之神。",
    sourceUrl: "https://news.game-beans.com/jx/sodNotice/20261014/8285.html",
    evaluationSourceUrl: "https://www.taptap.cn/moment/683697319169756235",
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
