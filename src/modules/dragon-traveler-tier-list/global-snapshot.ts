import type { ClassKey, Luminary, ServerSnapshot, TierKey } from "./types";

export const globalFactionKeys = [
  "Sanctum Glory",
  "Wild Spirit",
  "Arcane Wisdom",
  "Elemental Echo",
  "Illusion Veil",
  "Otherworld Return",
] as const;

export type GlobalFactionKey = (typeof globalFactionKeys)[number];

export const globalRarityKeys = ["SSR Ex", "SSR+", "SSR", "SR", "R", "N"] as const;
export type GlobalRarityKey = (typeof globalRarityKeys)[number];

type GlobalRow = readonly [
  name: string,
  rarity: GlobalRarityKey,
  classKey: ClassKey,
  factions: readonly GlobalFactionKey[],
  overall: TierKey,
  pve: TierKey,
  pvp: TierKey,
  note?: string,
];

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function toLuminary(row: GlobalRow): Luminary<GlobalFactionKey, GlobalRarityKey> {
  const [name, rarity, classKey, factions, overall, pve, pvp, note] = row;
  return {
    id: slugify(name),
    name,
    rarity,
    classKey,
    factions,
    tiers: { overall, pve, pvp },
    note:
      note ??
      classKey +
        " · " +
        rarity +
        " · " +
        factions.join(" / ") +
        ". Current verified snapshot: " +
        overall +
        " Overall, " +
        pve +
        " PvE, " +
        pvp +
        " PvP.",
  };
}

const rows = [
  [
    "Artemis",
    "SSR Ex",
    "Archer",
    ["Arcane Wisdom", "Illusion Veil"],
    "S+",
    "S+",
    "S+",
    "Current Global evaluations place Artemis at the top in both PvE and PvP; her account value remains high even outside a single-faction shell.",
  ],
  [
    "Hela",
    "SSR Ex",
    "Priest",
    ["Sanctum Glory", "Otherworld Return"],
    "S+",
    "S+",
    "S+",
    "Officially added to the Global Mythical pool in October 2026. Current evaluations value her healing, ally protection and control highly in both modes.",
  ],
  ["Venus", "SSR Ex", "Priest", ["Wild Spirit", "Elemental Echo"], "S+", "S", "S+"],
  ["Vivian", "SSR+", "Priest", ["Elemental Echo", "Sanctum Glory"], "S+", "S", "S+"],
  ["Poseidon", "SSR Ex", "Mage", ["Elemental Echo", "Illusion Veil"], "S+", "S", "S+"],
  ["Loki", "SSR Ex", "Mage", ["Otherworld Return", "Wild Spirit"], "S+", "S", "S+"],
  ["Xuanwu", "SSR+", "Guardian", ["Sanctum Glory", "Arcane Wisdom"], "S", "S+", "S"],
  ["Caesar", "SSR+", "Guardian", ["Sanctum Glory", "Illusion Veil"], "S", "S", "S+"],
  ["Pompey", "SSR+", "Guardian", ["Arcane Wisdom", "Illusion Veil"], "S", "S", "B"],
  ["Athena", "SSR Ex", "Guardian", ["Sanctum Glory", "Wild Spirit"], "S", "S+", "S"],
  ["Morgana", "SSR+", "Priest", ["Elemental Echo", "Illusion Veil"], "S", "S+", "S"],
  ["Hel", "SSR+", "Priest", ["Sanctum Glory", "Otherworld Return"], "S", "S", "S"],
  ["Lilith", "SSR+", "Assassin", ["Illusion Veil", "Wild Spirit"], "S", "S", "A"],
  ["Hades", "SSR Ex", "Assassin", ["Arcane Wisdom", "Otherworld Return"], "S", "S", "S"],
  ["Ares", "SSR Ex", "Warrior", ["Illusion Veil", "Arcane Wisdom"], "S", "S+", "S+"],
  ["Azure Dragon", "SSR+", "Warrior", ["Otherworld Return", "Arcane Wisdom"], "S", "S", "S"],
  ["Asmodeus", "SSR+", "Warrior", ["Otherworld Return", "Wild Spirit"], "S", "S+", "S"],
  ["Hitomi", "SSR+", "Warrior", ["Wild Spirit", "Sanctum Glory"], "S", "S", "A"],
  ["Apollo", "SSR Ex", "Archer", ["Otherworld Return", "Sanctum Glory"], "S", "S+", "S"],
  ["Mimir", "SSR+", "Archer", ["Sanctum Glory", "Arcane Wisdom"], "S", "S+", "A"],
  [
    "Talos",
    "SSR+",
    "Mage",
    ["Arcane Wisdom", "Wild Spirit"],
    "S",
    "S+",
    "S+",
    "Current evaluations rate Talos S+ in both PvE and PvP thanks to unusually strong opening tempo and damage.",
  ],
  ["Vermilion Bird", "SSR+", "Mage", ["Elemental Echo", "Illusion Veil"], "S", "S+", "S"],
  [
    "Arachne",
    "SSR+",
    "Mage",
    ["Illusion Veil", "Wild Spirit"],
    "S",
    "S",
    "S",
    "Current Global banner Luminary. Early current evaluations rate her S in both modes, with higher value in Punishment-oriented accounts than as a universal first pull.",
  ],
  ["Dvalin", "SSR+", "Guardian", ["Elemental Echo", "Wild Spirit"], "A", "S", "S"],
  ["Prometheus", "SSR Ex", "Guardian", ["Wild Spirit", "Arcane Wisdom"], "A", "S+", "S"],
  ["Salome", "SSR+", "Guardian", ["Elemental Echo", "Otherworld Return"], "A", "S", "S"],
  ["Heidren", "SSR+", "Guardian", ["Otherworld Return", "Wild Spirit"], "A", "S", "S"],
  ["Spimo", "SSR+", "Priest", ["Otherworld Return", "Wild Spirit"], "A", "S", "A"],
  ["Scheherazade", "SSR", "Priest", ["Arcane Wisdom", "Sanctum Glory"], "A", "S", "A"],
  ["Atanith", "SSR", "Priest", ["Illusion Veil", "Arcane Wisdom"], "A", "S+", "A"],
  ["Zagrus", "SSR+", "Assassin", ["Elemental Echo", "Arcane Wisdom"], "A", "S+", "A"],
  [
    "Rin",
    "SSR+",
    "Assassin",
    ["Sanctum Glory", "Otherworld Return"],
    "A",
    "S+",
    "S+",
    "Flexible damage, buffs and control keep Rin among the strongest broadly reusable SSR+ options.",
  ],
  ["Thor", "SSR Ex", "Warrior", ["Elemental Echo", "Sanctum Glory"], "A", "S", "S"],
  ["Tyrfing", "SSR+", "Warrior", ["Illusion Veil", "Wild Spirit"], "A", "S", "B"],
  ["Jing", "SSR+", "Archer", ["Wild Spirit", "Otherworld Return"], "A", "S+", "A"],
  ["Ningrose", "SSR+", "Archer", ["Illusion Veil", "Otherworld Return"], "A", "S", "A"],
  ["Himiko", "SSR+", "Archer", ["Arcane Wisdom", "Wild Spirit"], "A", "S", "S"],
  ["Gabriell", "SSR+", "Mage", ["Sanctum Glory", "Otherworld Return"], "A", "S", "S+"],
  ["Tamamo", "SSR+", "Mage", ["Wild Spirit", "Sanctum Glory"], "A", "S", "A"],
  ["Faust", "SSR+", "Mage", ["Otherworld Return", "Illusion Veil"], "A", "A", "B"],
  [
    "Goblin War Drummer",
    "R",
    "Priest",
    ["Wild Spirit", "Sanctum Glory"],
    "B",
    "B",
    "B",
    "Current client data verifies this low-rarity R Priest and its two factions. It is retained so the ranked snapshot does not silently erase lower-rarity live units.",
  ],
  ["Anubis", "SSR", "Guardian", ["Otherworld Return", "Elemental Echo"], "B", "B", "B"],
  ["Helveil", "SSR", "Guardian", ["Otherworld Return", "Sanctum Glory"], "B", "B", "A"],
  ["Herman", "SSR", "Guardian", ["Arcane Wisdom", "Illusion Veil"], "B", "S", "B"],
  ["Oberonnie", "SSR", "Guardian", ["Elemental Echo", "Wild Spirit"], "B", "A", "B"],
  ["Chiron", "SSR", "Priest", ["Sanctum Glory", "Wild Spirit"], "B", "S", "A"],
  ["Fenrir", "SSR", "Assassin", ["Elemental Echo", "Arcane Wisdom"], "B", "A", "B"],
  ["Nemesis", "SSR", "Assassin", ["Arcane Wisdom", "Illusion Veil"], "B", "A", "B"],
  ["Siegfried", "SSR", "Warrior", ["Elemental Echo", "Wild Spirit"], "B", "B", "B"],
  ["Marylis", "SSR+", "Warrior", ["Arcane Wisdom", "Wild Spirit"], "B", "B", "B"],
  ["Ifrit", "SSR+", "Archer", ["Elemental Echo", "Arcane Wisdom"], "B", "S", "S"],
  ["Medusa", "SSR", "Archer", ["Illusion Veil", "Otherworld Return"], "B", "S+", "B"],
  ["Lorillin", "SSR", "Archer", ["Sanctum Glory", "Elemental Echo"], "B", "A", "B"],
  ["Huginn & Muninn", "SSR", "Archer", ["Wild Spirit", "Illusion Veil"], "B", "A", "B"],
  ["Melina", "SSR", "Mage", ["Elemental Echo", "Sanctum Glory"], "B", "A", "C"],
  ["Nanalie", "SSR", "Mage", ["Wild Spirit", "Arcane Wisdom"], "B", "A", "B"],
  ["Gullveig", "SSR", "Mage", ["Otherworld Return", "Elemental Echo"], "B", "S", "B"],
  ["Drasill", "SSR", "Guardian", ["Wild Spirit", "Arcane Wisdom"], "B", "C", "B"],
  ["Goren", "SSR", "Guardian", ["Sanctum Glory", "Elemental Echo"], "B", "C", "C"],
  ["Caligula", "SSR", "Priest", ["Wild Spirit", "Otherworld Return"], "B", "B", "B"],
  ["Ophelia", "SSR+", "Priest", ["Sanctum Glory", "Illusion Veil"], "B", "A", "B"],
  ["Titania", "SSR", "Priest", ["Wild Spirit", "Elemental Echo"], "B", "B", "C"],
  ["Jormungandr", "SSR+", "Assassin", ["Sanctum Glory", "Illusion Veil"], "B", "B", "B"],
  ["Brynhild", "SSR+", "Warrior", ["Sanctum Glory", "Otherworld Return"], "B", "B", "B"],
  ["White Tiger", "SSR", "Assassin", ["Wild Spirit", "Otherworld Return"], "C", "C", "C"],
  ["Asteros", "SSR+", "Warrior", ["Wild Spirit"], "C", "A", "B"],
  ["Telperion", "SSR", "Mage", ["Elemental Echo", "Illusion Veil"], "C", "A", "C"],
  ["Cleopatra", "SSR", "Mage", ["Otherworld Return", "Arcane Wisdom"], "C", "B", "C"],
  ["Gudong", "SSR", "Guardian", ["Otherworld Return", "Illusion Veil"], "C", "C", "C"],
  ["Pan Junbao", "SSR", "Assassin", ["Wild Spirit", "Illusion Veil"], "C", "C", "C"],
  ["Arthur", "SSR", "Warrior", ["Sanctum Glory", "Illusion Veil"], "C", "C", "C"],
  ["Beowulf", "SSR", "Warrior", ["Otherworld Return", "Arcane Wisdom"], "C", "C", "C"],
  ["Guna", "SSR", "Warrior", ["Sanctum Glory", "Illusion Veil"], "C", "C", "C"],
  ["Van Helsing", "SSR", "Archer", ["Arcane Wisdom"], "C", "C", "C"],
  ["Cerberus", "SSR", "Mage", ["Illusion Veil", "Elemental Echo"], "C", "C", "C"],
] as const satisfies readonly GlobalRow[];

export const globalSnapshot = {
  server: "global",
  label: "Global",
  snapshotDate: "2026-10-28",
  coverageNote:
    "Current ranked snapshot plus the live October additions Hela and Arachne. The displayed count is ranked coverage, not a claim about every collectible object in the client.",
  factionKeys: globalFactionKeys,
  factionLabels: {
    "Sanctum Glory": "Sanctum Glory",
    "Wild Spirit": "Wild Spirit",
    "Arcane Wisdom": "Arcane Wisdom",
    "Elemental Echo": "Elemental Echo",
    "Illusion Veil": "Illusion Veil",
    "Otherworld Return": "Otherworld Return",
  },
  rarityKeys: globalRarityKeys,
  luminaries: rows.map(toLuminary),
  quickPicks: [
    { label: "Best Overall", luminaryId: "artemis", rationale: "S+ across Overall, PvE and PvP." },
    {
      label: "Best PvE",
      luminaryId: "hela",
      rationale: "S+ PvE support with current Mythical availability.",
    },
    { label: "Best PvP", luminaryId: "artemis", rationale: "Current S+ PvP benchmark." },
    {
      label: "Best New Player Pick",
      luminaryId: "athena",
      rationale: "Premium frontline value with broad PvE utility.",
    },
    {
      label: "Best Low-Investment Pick",
      luminaryId: "vivian",
      rationale: "High-value support slot across multiple shells.",
    },
  ],
} as const satisfies ServerSnapshot<GlobalFactionKey, GlobalRarityKey>;
