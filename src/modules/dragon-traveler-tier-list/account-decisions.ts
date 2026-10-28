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
];
