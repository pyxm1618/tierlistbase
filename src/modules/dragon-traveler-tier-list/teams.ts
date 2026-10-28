import type { TeamRecommendation } from "./types";

export const dragonTravelerTeams = [
  {
    id: "global-otherworld-pve",
    server: "global",
    mode: "pve",
    name: "Otherworld Return progression core",
    members: ["Anubis", "Asmodeus", "Spimo", "Azure Dragon", "Faust", "Loki"],
    context:
      "A current Otherworld-focused progression shell. Use the reserves to adapt survivability and damage to the encounter instead of treating the six slots as immutable.",
    metric: "PvE: faction-synergy progression core",
  },
  {
    id: "global-artemis-flex-pve",
    server: "global",
    mode: "pve",
    name: "Artemis carry shell",
    members: ["Artemis", "Athena", "Hela", "Morgana", "Talos", "Rin"],
    context:
      "A high-investment shell built around current S+ PvE units. The exact sixth slot should follow faction bonuses and the stage mechanic.",
    metric: "PvE: S+ carry + sustain + control",
  },
  {
    id: "global-control-pvp",
    server: "global",
    mode: "pvp",
    name: "Mythic control pressure",
    members: ["Artemis", "Loki", "Hades", "Ares", "Hela", "Caesar"],
    context:
      "Leans on current S+/S PvP placements, opening protection and control. Speed, star level and matchup remain decisive.",
    metric: "PvP: current top-tier pressure",
  },
  {
    id: "global-punishment-pvp",
    server: "global",
    mode: "pvp",
    name: "Arachne punishment shell",
    members: ["Arachne", "Medusa", "Caesar", "Morgana", "Rin", "Talos"],
    context:
      "A situational Punishment-oriented option for accounts already holding the supporting core; not a reason by itself to force the current banner.",
    metric: "PvP: specialist / account-dependent",
  },
  {
    id: "taiwan-mythic-pve",
    server: "taiwan",
    mode: "pve",
    name: "Mythic progression shell",
    members: ["Artemis", "Hypnos", "Gaia", "Prometheus", "Apollo", "Talos"],
    context:
      "Uses current Taiwan Mythical options with a proven SSR+/傳說+ damage slot. Adjust the final slots to faction activation and encounter pressure.",
    metric: "PvE: current Mythical pool coverage",
  },
  {
    id: "taiwan-illusion-pve",
    server: "taiwan",
    mode: "pve",
    name: "Illusion control core",
    members: ["Hypnos", "Arachne", "Honoka", "Caesar", "Morgana", "Rin"],
    context:
      "Control-heavy shell with multiple Illusion Veil members. It is strongest where the account can activate faction bonuses without sacrificing frontline stability.",
    metric: "PvE: control + dual-faction flexibility",
  },
  {
    id: "taiwan-gaia-pvp",
    server: "taiwan",
    mode: "pvp",
    name: "Gaia / Hypnos control",
    members: ["Gaia", "Hypnos", "Artemis", "Loki", "Hades", "Honoka"],
    context:
      "Reflects the current Taiwan-side emphasis on Gaia and Hypnos in defensive/control shells while retaining high-end burst threats.",
    metric: "PvP: control-first premium shell",
  },
  {
    id: "taiwan-sanctum-pvp",
    server: "taiwan",
    mode: "pvp",
    name: "Sanctum pressure",
    members: ["Athena", "Rin", "Apollo", "Vivian", "Hitomi", "Xuanwu"],
    context:
      "A more conventional protected-carry shell for accounts whose investment is concentrated in Sanctum-linked Luminaries.",
    metric: "PvP: protection + burst",
  },
] as const satisfies readonly TeamRecommendation[];
