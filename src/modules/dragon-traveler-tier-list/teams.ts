import type { TeamRecommendation } from "./types";

export const teamRecommendations: readonly TeamRecommendation[] = [
  {
    server: "global",
    mode: "pve",
    name: "Sanctum progression core",
    core: ["Apollo", "Gabriele", "Rin", "Vivienne", "Scheherazade", "Athena"],
    why: "A current end-game Sanctum shell with premium frontline stability, sustain, and single-target pressure.",
    sourceLabel: "Dragon Companion team database",
  },
  {
    server: "global",
    mode: "pvp",
    name: "Sanctum control core",
    core: ["Apollo", "Gabriele", "Poseidon", "Vivienne", "Scheherazade", "Caesar"],
    why: "Pairs high-value opening protection with control, sustain, and reliable ranged pressure.",
    sourceLabel: "Dragon Companion team database",
  },
  {
    server: "taiwan",
    mode: "pve",
    name: "聖堂 / 奧術穩定推進",
    core: ["雅典娜", "阿波羅", "山魯佐德", "伊芙利特", "玄武", "修普諾斯"],
    why: "優先確保前排與續航，再用高品質遠程核心處理高難度推進內容。",
    sourceLabel: "Taiwan community progression guide + current official roster notices",
  },
  {
    server: "taiwan",
    mode: "pvp",
    name: "神話控場核心",
    core: ["修普諾斯", "波塞冬", "雅典娜", "阿爾忒彌斯", "玄武", "山魯佐德"],
    why: "以控制、保命與後排壓力為主，適合當前台服高階 PvP 的長線養成思路。",
    sourceLabel: "Taiwan community progression guide + current official roster notices",
  },
];
