import type { AccountDecision } from "./types";

export const accountDecisions: readonly AccountDecision[] = [
  {
    server: "global",
    type: "reroll",
    title: "Reroll",
    recommendation: "Prefer Athena, Artemis, Poseidon, Hela, or another top EX anchor.",
    rationale:
      "A durable frontline, premium carry, or top support gives a new account the widest early progression margin.",
    sourceLabel: "Current Global ranking synthesis",
  },
  {
    server: "global",
    type: "wishlist",
    title: "Wishlist",
    recommendation:
      "Fill account gaps first: sustain → frontline → main carry → faction-specific upgrades.",
    rationale:
      "Duplicate power matters, but a balanced account usually gains more from fixing missing roles before chasing luxury depth.",
    sourceLabel: "Current Global ranking synthesis",
  },
  {
    server: "global",
    type: "pull",
    title: "Current Pull Priority",
    recommendation:
      "Arachne is strong, but not a mandatory pull for accounts already holding top meta cores.",
    rationale:
      "The current evaluation rates her S in both PvE and PvP, below the most universal S+ anchors.",
    sourceLabel: "AllClash, updated 2026-10-25",
  },
  {
    server: "taiwan",
    type: "reroll",
    title: "Reroll",
    recommendation: "優先神話級泛用核心：雅典娜、阿爾忒彌斯、波塞冬等。",
    rationale: "新帳號最需要能同時支撐開荒、推圖與後續高難內容的核心。",
    sourceLabel: "Taiwan community guide",
  },
  {
    server: "taiwan",
    type: "wishlist",
    title: "Wishlist",
    recommendation: "先補坦、奶與主 C，再做單一陣營的深度養成。",
    rationale: "台服後期更看重完整陣容與高階養成，過早追求窄陣營深度容易卡資源。",
    sourceLabel: "Taiwan community guide",
  },
  {
    server: "taiwan",
    type: "pull",
    title: "Current Pull Priority",
    recommendation:
      "10/15–10/29 神話召喚池優先考慮符合帳號缺口的阿爾忒彌斯 / 修普諾斯等高價值神話。",
    rationale: "官方當期神話池包含睡神、大地之母、月神、捷足之神；不要把返場名單誤當成永久卡池。",
    sourceLabel: "GameBeans 2026-10-14 live notice",
  },
];
