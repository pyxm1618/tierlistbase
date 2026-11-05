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
    server: "global",
    bannerName: "Mythical Summon — Select SSR Ex Luminary",
    characterIds: [
      "hel",
      "prometheus",
      "artemis",
      "thor",
      "loki",
      "ares",
      "apollo",
      "venus",
      "athena",
      "poseidon",
      "hades",
    ],
    officialPool: [
      "Goddess of Death - Hela",
      "Firethief Goddess - Prometheus",
      "Goddess of the Moon - Artemis",
      "Thunder Goddess - Thor",
      "Goddess of Trickery - Loki",
      "Goddess of War - Ares",
      "Sun Goddess - Apollo",
      "Love Goddess - Venus",
      "Goddess of Wisdom - Athena",
      "Sea Goddess - Poseidon",
      "King of the Underworld - Hades",
    ],
    startsAt: "2026-10-29T05:00:00-05:00",
    endsAt: "2026-11-12T05:00:00-05:00",
    windowLabel: "10/29 05:00–11/12 04:59 (UTC−5)",
    recommendation: "Consider",
    rationale:
      "For this selectable SSR Ex pool, Poseidon, Loki, Artemis and Venus sit in the current Global top Overall band. Choose for the team and faction gap you actually need; this is editorial advice, not an official strength rating.",
    sourceUrl: "https://www.hideoutgacha.com/news/dragon-traveler/october-29-mythical-summon-vajra",
    evaluationSourceUrl: "https://www.hideoutgacha.com/games/dragon-traveler/tier-list",
    checkedAt: "2026-11-03",
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
  {
    server: "taiwan",
    bannerName: "傳說神話召喚 — 洛基 / 普羅米修士 / 赫拉 / 阿瑞斯",
    characterIds: ["loki", "prometheus", "hera", "ares"],
    officialPool: ["詭計之神‧洛基", "盜火之神‧普羅米修士", "天后‧赫拉", "戰神‧阿瑞斯"],
    startsAt: "2026-10-29T05:00:00+08:00",
    // The official notice's last minute is 04:59; use an exclusive 05:00 boundary.
    endsAt: "2026-11-12T05:00:00+08:00",
    windowLabel: "10/29 05:00–11/12 04:59 (UTC+8)",
    recommendation: "Consider",
    rationale:
      "Consider Loki or Prometheus first when they solve a roster gap; Hera and Ares are more account- and faction-dependent. This follows the current Taiwan rankings and is editorial advice, not an official strength rating.",
    sourceUrl: "https://news.game-beans.com/jx/sodNotice/20261027/8301.html",
    evaluationSourceUrl: "https://www.hideoutgacha.com/games/dragon-traveler/tier-list",
    checkedAt: "2026-11-03",
  },
  {
    server: "taiwan",
    bannerName: "限定召喚卡池 — 戀歌謬斯‧艾拉托",
    characterIds: ["erato"],
    officialPool: ["戀歌謬斯‧艾拉托"],
    startsAt: "2026-11-05T05:00:00+08:00",
    // The official notice's last minute is 04:59; use an exclusive 05:00 boundary.
    endsAt: "2026-11-19T05:00:00+08:00",
    windowLabel: "11/5 05:00–11/19 04:59 (UTC+8)",
    recommendation: "Wait for Testing",
    rationale:
      "Erato is live on Taiwan, but the official release notice provides mechanics and availability rather than an independent strength ranking, and no reliable post-release evaluation was verified. Wait for testing before making a power-based pull decision. The 10/29 Mythical Summon (Loki / Prometheus / Hera / Ares) remains active in parallel through 11/12 04:59 (UTC+8).",
    sourceUrl: "https://sod.game-beans.com/jx/sodNotice/20261104/8323.html",
    evaluationSourceUrl: "https://sod.game-beans.com/jx/sodNotice/20261104/8323.html",
    checkedAt: "2026-11-05",
  },
];

export function currentBannerAt(server: ServerKey, now: number): VerifiedBanner | null {
  if (!Number.isFinite(now)) return null;

  const activeBanners = verifiedBanners.filter(
    (banner) =>
      banner.server === server &&
      now >= Date.parse(banner.startsAt) &&
      now < Date.parse(banner.endsAt),
  );
  activeBanners.sort((left, right) => Date.parse(right.startsAt) - Date.parse(left.startsAt));
  return activeBanners[0] ?? null;
}
