import type { AccountDecision } from "./types";

export const dragonTravelerAccountDecisions: readonly AccountDecision[] = [
  {
    server: "global",
    type: "reroll",
    title: "Reroll",
    priority: "High",
    targets: ["Artemis", "Hela", "Talos"],
    rationale:
      "These are current S+ account anchors across the published Global rankings. Prioritize one premium anchor plus a usable frontline rather than chasing a perfect six-unit opening.",
  },
  {
    server: "global",
    type: "wishlist",
    title: "Wishlist",
    priority: "High",
    targets: ["Rin", "Morgana", "Vivian", "Xuanwu"],
    rationale:
      "Flexible support, protection and damage pieces remain more reusable than narrow faction-only upgrades when the roster is still developing.",
  },
  {
    server: "global",
    type: "pull",
    title: "Current Pull Priority",
    priority: "Medium",
    targets: ["Arachne", "Hela / Mythical pool"],
    rationale:
      "Arachne is current and rated S in both PvE and PvP, but current evaluations do not treat her as a universal must-pull. The Mythical pool remains the stronger account-level target when it can add a missing S+ anchor.",
    timing: "Arachne: Oct 22–Nov 5; current Mythical round: Oct 15–Oct 29 (UTC-5).",
  },
  {
    server: "taiwan",
    type: "reroll",
    title: "Reroll",
    priority: "High",
    targets: ["Artemis", "Gaia", "Hypnos"],
    rationale:
      "Current Mythical options provide the cleanest long-term account anchors. Pair one with a stable frontline/support core instead of rerolling for a complete faction package.",
  },
  {
    server: "taiwan",
    type: "wishlist",
    title: "Wishlist",
    priority: "High",
    targets: ["Talos", "Rin", "Vivian", "Honoka"],
    rationale:
      "These 傳說+ options cover damage, control and sustain across multiple team shells and reduce dependence on a single faction.",
  },
  {
    server: "taiwan",
    type: "pull",
    title: "Current Pull Priority",
    priority: "High",
    targets: ["Artemis", "Gaia", "Hypnos"],
    rationale:
      "The current 傳說神話 summon lets the account choose among the featured Mythical options. Fill the largest roster gap first; do not treat every featured unit as mandatory.",
    timing: "Current Taiwan Mythical Summon: Oct 15–Oct 29.",
  },
];
