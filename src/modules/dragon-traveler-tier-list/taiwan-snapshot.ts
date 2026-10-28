import type { ClassKey, Luminary, ServerSnapshot, TierKey } from "./types";

export const taiwanFactionKeys = [
  "聖堂榮光",
  "曠野之靈",
  "奧術智慧",
  "元素迴響",
  "幻境秘影",
  "彼岸再臨",
] as const;

export type TaiwanFactionKey = (typeof taiwanFactionKeys)[number];

export const taiwanRarityKeys = ["傳說‧神話", "傳說+", "傳說", "史詩", "菁英", "普通"] as const;
export type TaiwanRarityKey = (typeof taiwanRarityKeys)[number];

type TaiwanRow = readonly [
  name: string,
  rarity: TaiwanRarityKey,
  classKey: ClassKey,
  factions: readonly TaiwanFactionKey[],
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

function toLuminary(row: TaiwanRow): Luminary<TaiwanFactionKey, TaiwanRarityKey> {
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
        ". Taiwan snapshot: " +
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
    "傳說‧神話",
    "Archer",
    ["奧術智慧", "幻境秘影"],
    "S+",
    "S+",
    "S+",
    "Current Taiwan official material identifies Artemis as 傳說‧神話, Archer, 奧術智慧 / 幻境秘影. She remains a top cross-mode account anchor.",
  ],
  [
    "Hypnos",
    "傳說‧神話",
    "Priest",
    ["奧術智慧", "幻境秘影"],
    "S+",
    "S+",
    "S",
    "Current Taiwan official material identifies Hypnos as 傳說‧神話, Priest, 奧術智慧 / 幻境秘影 and includes her in the active Mythical selection.",
  ],
  [
    "Gaia",
    "傳說‧神話",
    "Guardian",
    ["幻境秘影", "彼岸再臨"],
    "S+",
    "S+",
    "S+",
    "Current Taiwan Mythical selection option and a premium defensive/control anchor.",
  ],
  ["Loki", "傳說‧神話", "Mage", ["彼岸再臨", "曠野之靈"], "S+", "S", "S+"],
  ["Poseidon", "傳說‧神話", "Mage", ["元素迴響", "幻境秘影"], "S+", "S", "S+"],
  ["Hades", "傳說‧神話", "Assassin", ["奧術智慧", "彼岸再臨"], "S", "S", "S+"],
  ["Ares", "傳說‧神話", "Warrior", ["幻境秘影", "奧術智慧"], "S", "S+", "S+"],
  ["Apollo", "傳說‧神話", "Archer", ["彼岸再臨", "聖堂榮光"], "S", "S+", "S"],
  ["Thor", "傳說‧神話", "Warrior", ["元素迴響", "聖堂榮光"], "A", "S", "S"],
  ["Prometheus", "傳說‧神話", "Guardian", ["曠野之靈", "奧術智慧"], "A", "S+", "S"],
  ["Hermes", "傳說‧神話", "Assassin", ["元素迴響", "幻境秘影"], "A", "S", "S"],
  ["Talos", "傳說+", "Mage", ["奧術智慧", "曠野之靈"], "S+", "S+", "S+"],
  ["Rin", "傳說+", "Assassin", ["聖堂榮光", "彼岸再臨"], "S+", "S+", "S+"],
  ["Vivian", "傳說+", "Priest", ["元素迴響", "聖堂榮光"], "S+", "S", "S+"],
  ["Venus", "傳說+", "Priest", ["曠野之靈", "元素迴響"], "S+", "S", "S+"],
  [
    "Honoka",
    "傳說+",
    "Priest",
    ["幻境秘影", "奧術智慧"],
    "S+",
    "S+",
    "S",
    "Current Taiwan-side character data keeps Honoka in the premium support group and verifies her dual-faction identity.",
  ],
  ["Athena", "傳說+", "Guardian", ["聖堂榮光", "曠野之靈"], "S", "S+", "S"],
  ["Caesar", "傳說+", "Guardian", ["聖堂榮光", "幻境秘影"], "S", "S", "S+"],
  ["Xuanwu", "傳說+", "Guardian", ["聖堂榮光", "奧術智慧"], "S", "S+", "S"],
  ["Morgana", "傳說+", "Priest", ["元素迴響", "幻境秘影"], "S", "S+", "S"],
  ["Hel", "傳說+", "Priest", ["聖堂榮光", "彼岸再臨"], "S", "S", "S"],
  ["Lilith", "傳說+", "Assassin", ["幻境秘影", "曠野之靈"], "S", "S", "A"],
  ["Asmodeus", "傳說+", "Warrior", ["彼岸再臨", "曠野之靈"], "S", "S+", "S"],
  ["Azure Dragon", "傳說+", "Warrior", ["彼岸再臨", "奧術智慧"], "S", "S", "S"],
  ["Hitomi", "傳說+", "Warrior", ["曠野之靈", "聖堂榮光"], "S", "S", "A"],
  ["Mimir", "傳說+", "Archer", ["聖堂榮光", "奧術智慧"], "S", "S+", "A"],
  ["Vermilion Bird", "傳說+", "Mage", ["元素迴響", "幻境秘影"], "S", "S+", "S"],
  [
    "Arachne",
    "傳說+",
    "Mage",
    ["幻境秘影", "曠野之靈"],
    "S",
    "S",
    "S",
    "Taiwan official notices identify Arachne as 傳說+, Mage, 幻境秘影 / 曠野之靈. Her value is strongest in accounts that can use her control/Punishment context.",
  ],
  ["Quetzal", "傳說+", "Priest", ["彼岸再臨", "奧術智慧"], "A", "S", "A"],
  ["Himiko", "傳說+", "Archer", ["奧術智慧", "曠野之靈"], "A", "S", "S"],
  ["Saad", "傳說+", "Warrior", ["元素迴響", "幻境秘影"], "A", "S", "A"],
  ["Biqisi", "傳說+", "Priest", ["曠野之靈", "奧術智慧"], "A", "A", "A"],
  ["Atanith", "傳說", "Priest", ["幻境秘影", "奧術智慧"], "A", "S", "A"],
  ["Scheherazade", "傳說", "Priest", ["奧術智慧", "聖堂榮光"], "A", "S", "A"],
  ["Chiron", "傳說", "Priest", ["聖堂榮光", "曠野之靈"], "B", "S", "A"],
  ["Medusa", "傳說", "Archer", ["幻境秘影", "彼岸再臨"], "B", "S+", "B"],
  ["Nanalie", "傳說", "Mage", ["曠野之靈", "奧術智慧"], "B", "A", "B"],
  ["Gullveig", "傳說", "Mage", ["彼岸再臨", "元素迴響"], "B", "S", "B"],
  [
    "Siegfried",
    "史詩",
    "Warrior",
    ["元素迴響", "曠野之靈"],
    "B",
    "B",
    "B",
    "Taiwan official notices use 史詩 as a Luminary quality. It remains a separate Taiwan label rather than being force-mapped to Global SR.",
  ],
] as const satisfies readonly TaiwanRow[];

export const taiwanSnapshot = {
  server: "taiwan",
  label: "Taiwan",
  snapshotDate: "2026-10-28",
  coverageNote:
    "Verified Taiwan ranked snapshot. The filter keeps the live Luminary quality hierarchy through 傳說‧神話 / 傳說+ / 傳說 / 史詩 / 菁英 / 普通; the displayed ranked records are a curated snapshot, not a claim about the full live roster.",
  factionKeys: taiwanFactionKeys,
  factionLabels: {
    聖堂榮光: "Sanctum Glory · 聖堂榮光",
    曠野之靈: "Wild Spirit · 曠野之靈",
    奧術智慧: "Arcane Wisdom · 奧術智慧",
    元素迴響: "Elemental Echo · 元素迴響",
    幻境秘影: "Illusion Veil · 幻境秘影",
    彼岸再臨: "Otherworld Return · 彼岸再臨",
  },
  rarityKeys: taiwanRarityKeys,
  luminaries: rows.map(toLuminary),
  quickPicks: [
    {
      label: "Best Overall",
      luminaryId: "artemis",
      rationale: "S+ across the current Taiwan snapshot.",
    },
    {
      label: "Best PvE",
      luminaryId: "hypnos",
      rationale: "Current Mythical support with S+ PvE value.",
    },
    { label: "Best PvP", luminaryId: "gaia", rationale: "Premium control/frontline anchor." },
    {
      label: "Best New Player Pick",
      luminaryId: "artemis",
      rationale: "Current Mythical selection with cross-mode value.",
    },
    {
      label: "Best Low-Investment Pick",
      luminaryId: "honoka",
      rationale: "Flexible 傳說+ support value.",
    },
  ],
} as const satisfies ServerSnapshot<TaiwanFactionKey, TaiwanRarityKey>;
