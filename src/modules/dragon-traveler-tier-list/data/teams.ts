import type { ServerKey, Team, TeamViewKey } from "../data";
import { verifiedCharacters } from "./verified-roster";
// Source cell coordinates: column 0/1/2 = back/middle/front; row 0/1/2 = left/center/right.
// Recommendation order and team grades are editorial, not measured win rates.
const formations = [
  {
    sourceFormationId: "pve-arcane-1",
    name: "Arcane opening pressure",
    archetype: "Cooldown and backline pressure",
    members: [
      {
        characterId: "artemis",
        position: "Backline",
        slot: "Left",
        role: "Artemis · Backline",
      },
      {
        characterId: "himiko",
        position: "Backline",
        slot: "Center",
        role: "Himiko · Backline",
      },
      {
        characterId: "talos",
        position: "Backline",
        slot: "Right",
        role: "Talos · Backline",
      },
      {
        characterId: "azure-dragon",
        position: "Midline",
        slot: "Left",
        role: "Azure Dragon · Midline",
      },
      {
        characterId: "poseidon",
        position: "Midline",
        slot: "Center",
        role: "Poseidon · Midline",
      },
      {
        characterId: "pompey",
        position: "Frontline",
        slot: "Center",
        role: "Pompey · Frontline",
      },
    ],
    alternatives: ["ifrit", "atanith", "scheherazade"],
    synergy:
      "Pompey holds the front while Azure Dragon shields the opening. Talos and the two archers pressure the backline.",
    modes: ["PvE", "PvP"],
  },
  {
    sourceFormationId: "pve-sanctum-4",
    name: "Sanctum ranged core",
    archetype: "Burst with cleanse support",
    members: [
      {
        characterId: "apollo",
        position: "Backline",
        slot: "Left",
        role: "Burst damage",
      },
      {
        characterId: "gabriell",
        position: "Backline",
        slot: "Center",
        role: "AoE Burst",
      },
      {
        characterId: "lorillin",
        position: "Backline",
        slot: "Right",
        role: "Interrupter",
      },
      {
        characterId: "vivian",
        position: "Midline",
        slot: "Left",
        role: "Damage Boost",
      },
      {
        characterId: "chiron",
        position: "Midline",
        slot: "Right",
        role: "Dispel Debuffs",
      },
      {
        characterId: "athena",
        position: "Frontline",
        slot: "Center",
        role: "AoE Taunt",
      },
    ],
    alternatives: ["helveil", "scheherazade", "orion"],
    synergy:
      "Athena gathers threats. Apollo and Gabriell supply damage while Vivian amplifies a carry and Chiron clears debuffs.",
    modes: ["PvE"],
  },
  {
    sourceFormationId: "pve-rebirth-1",
    name: "Otherworld summon engine",
    archetype: "Summon amplification",
    members: [
      {
        characterId: "faust",
        position: "Backline",
        slot: "Left",
        role: "Faust · Backline",
      },
      {
        characterId: "spimo",
        position: "Backline",
        slot: "Center",
        role: "Spimo · Backline",
      },
      {
        characterId: "loki",
        position: "Backline",
        slot: "Right",
        role: "Loki · Backline",
      },
      {
        characterId: "asmodeus",
        position: "Midline",
        slot: "Left",
        role: "Asmodeus · Midline",
      },
      {
        characterId: "azure-dragon",
        position: "Midline",
        slot: "Right",
        role: "Azure Dragon · Midline",
      },
      {
        characterId: "heidren",
        position: "Frontline",
        slot: "Center",
        role: "Heidren · Frontline",
      },
    ],
    alternatives: ["anubis", "jing"],
    synergy:
      "Asmodeus strengthens summons, Spimo duplicates them and Heidren supports the summon damage plan. Build the engine together.",
    modes: ["PvE"],
  },
  {
    sourceFormationId: "pve-echo-4",
    name: "Elemental reaction line",
    archetype: "Reaction damage and sustain",
    members: [
      {
        characterId: "venus",
        position: "Backline",
        slot: "Left",
        role: "AoE Heal",
      },
      {
        characterId: "zagrus",
        position: "Backline",
        slot: "Center",
        role: "Chain Control",
      },
      {
        characterId: "morgana",
        position: "Backline",
        slot: "Right",
        role: "Support",
      },
      {
        characterId: "vermilion-bird",
        position: "Midline",
        slot: "Center",
        role: "Sustained DPS",
      },
      {
        characterId: "thor",
        position: "Midline",
        slot: "Right",
        role: "Trigger Burst Explosion",
      },
      {
        characterId: "dvalin",
        position: "Frontline",
        slot: "Center",
        role: "Counters Dual Assassins",
      },
    ],
    alternatives: [],
    synergy:
      "Dvalin protects the backline while elemental attacks feed reactions. Venus and Morgana sustain the damage plan.",
    modes: ["PvE"],
  },
  {
    sourceFormationId: "pvp-arcane-2",
    name: "Arcane protected carry",
    archetype: "Shield and carry amplification",
    members: [
      {
        characterId: "scheherazade",
        position: "Backline",
        slot: "Left",
        role: "Scheherazade · Backline",
      },
      {
        characterId: "artemis",
        position: "Backline",
        slot: "Center",
        role: "Artemis · Backline",
      },
      {
        characterId: "mimir",
        position: "Backline",
        slot: "Right",
        role: "Mimir · Backline",
      },
      {
        characterId: "vivian",
        position: "Midline",
        slot: "Right",
        role: "Vivian · Midline",
      },
      {
        characterId: "azure-dragon",
        position: "Frontline",
        slot: "Left",
        role: "Azure Dragon · Frontline",
      },
      {
        characterId: "xuanwu",
        position: "Frontline",
        slot: "Center",
        role: "Xuanwu · Frontline",
      },
    ],
    alternatives: [],
    synergy:
      "Xuanwu and Azure Dragon shield the damage core. Vivian amplifies a carry while Scheherazade reduces activation costs.",
    modes: ["PvP"],
  },
  {
    sourceFormationId: "pvp-arcane-3",
    name: "Arcane interruption",
    archetype: "Silence and sustained pressure",
    members: [
      {
        characterId: "atanith",
        position: "Backline",
        slot: "Left",
        role: "Atanith · Backline",
      },
      {
        characterId: "ifrit",
        position: "Backline",
        slot: "Center",
        role: "Ifrit · Backline",
      },
      {
        characterId: "poseidon",
        position: "Backline",
        slot: "Right",
        role: "Poseidon · Backline",
      },
      {
        characterId: "vivian",
        position: "Midline",
        slot: "Left",
        role: "Vivian · Midline",
      },
      {
        characterId: "scheherazade",
        position: "Midline",
        slot: "Right",
        role: "Scheherazade · Midline",
      },
      {
        characterId: "pompey",
        position: "Frontline",
        slot: "Center",
        role: "Pompey · Frontline",
      },
    ],
    alternatives: ["hades", "fenrir", "marylis", "nemesis"],
    synergy:
      "Atanith interrupts enemy skills so the ranged core can keep attacking. Vivian and Scheherazade provide amplification and cost support.",
    modes: ["PvP"],
  },
  {
    sourceFormationId: "pvp-arcane-4",
    name: "Arcane flexible protection",
    archetype: "Shielded ranged pressure",
    members: [
      {
        characterId: "atanith",
        position: "Backline",
        slot: "Left",
        role: "Atanith · Backline",
      },
      {
        characterId: "ifrit",
        position: "Backline",
        slot: "Center",
        role: "Ifrit · Backline",
      },
      {
        characterId: "poseidon",
        position: "Backline",
        slot: "Right",
        role: "Poseidon · Backline",
      },
      {
        characterId: "vivian",
        position: "Midline",
        slot: "Left",
        role: "Vivian · Midline",
      },
      {
        characterId: "azure-dragon",
        position: "Midline",
        slot: "Right",
        role: "Azure Dragon · Midline",
      },
      {
        characterId: "pompey",
        position: "Frontline",
        slot: "Center",
        role: "Pompey · Frontline",
      },
    ],
    alternatives: [],
    synergy:
      "Azure Dragon trades an extra support slot for shields. Keep Atanith’s control aligned with Ifrit’s damage window.",
    modes: ["PvP"],
  },
] as const;
export const teamRecommendations: readonly Team[] = (["global", "taiwan"] as const).flatMap(
  (server: ServerKey) =>
    (["PvE", "PvP"] as const).flatMap((view: TeamViewKey) =>
      formations
        .filter((f) => (f.modes as readonly TeamViewKey[]).includes(view))
        .map((f, index) => ({
          id: `${server}-${view}-${index + 1}`,
          server,
          view,
          rank: index + 1,
          tier: index === 0 ? "S+" : "S",
          name: f.name,
          sourceFormationId: f.sourceFormationId,
          archetype: f.archetype,
          investmentLevel: "High",
          members: f.members,
          coreSynergy: f.synergy,
          bestFor: [view],
          alternatives: f.alternatives.filter((id) =>
            verifiedCharacters.some(
              (c) => c.id === id && (c.servers as readonly ServerKey[]).includes(server),
            ),
          ),
          evidenceSourceIds: ["hideout-teams"],
        })),
    ),
);
