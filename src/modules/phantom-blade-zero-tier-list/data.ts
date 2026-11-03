import { phantomBladeZeroAssetProvenance } from "./asset-provenance";

export type RankingKind = "main_weapon" | "phantom_edge";
export type Tier = "S" | "A" | "B" | "C";
export type ReviewStatus = Tier | "Pending" | "Needs Review";

export type RankingSource = {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly nature: "official" | "ranking" | "supporting";
  readonly independenceGroup?: string;
  readonly methodology?: string;
};

export type SourcePlacement =
  | { readonly sourceId: string; readonly method: "tier"; readonly tier: Tier }
  | {
      readonly sourceId: string;
      readonly method: "ordinal";
      readonly rank: number;
      readonly fieldSize: number;
    };

export type RankingEntity = {
  readonly id: string;
  readonly name: string;
  readonly kind: RankingKind;
  readonly category: string;
  readonly bestFor: readonly string[];
  readonly easeOfUse: "Easy" | "Medium" | "Hard" | "Needs Review";
  readonly strengths: readonly string[];
  readonly limitations: readonly string[];
  readonly whyThisTier: string;
  readonly acquisition: string;
  readonly mechanics: readonly string[];
  readonly placements: readonly SourcePlacement[];
  readonly override?: {
    readonly finalTier: Tier;
    readonly reason: string;
    readonly supportingEvidence: readonly string[];
  };
};

export type ReviewedRankingEntity = RankingEntity & {
  readonly independentSourceCount: number;
  readonly consensusTier: Tier | null;
  readonly finalTier: ReviewStatus;
  readonly disagreement: boolean;
};

export const phantomBladeZeroSources: readonly RankingSource[] = [
  {
    id: "official-sgame",
    name: "S-GAME – Phantom Blade Zero",
    url: "https://pbz.s-game.com/m/en-US/",
    nature: "official",
  },
  {
    id: "official-playstation-arsenal",
    name: "PlayStation Blog – State of Play combat deep dive",
    url: "https://blog.playstation.com/2026/08/17/phantom-blade-zero-state-of-play-dives-deep-into-combat-and-the-wulin-world/",
    nature: "official",
  },
  {
    id: "official-playstation-launch",
    name: "PlayStation Blog – Boss weapons transform combat and exploration",
    url: "https://blog.playstation.com/2026/10/28/phantom-blade-zero-how-boss-weapons-transform-combat-and-exploration/",
    nature: "official",
  },
  {
    id: "keen-main",
    name: "KeenGamer – Best Weapons Tier List",
    url: "https://www.keengamer.com/articles/guides/phantom-blade-zero-best-weapons-tier-list/",
    nature: "ranking",
    independenceGroup: "keengamer-main-editorial",
    methodology: "S/A/B editorial tiers based on practical combat performance.",
  },
  {
    id: "gamesgg-main",
    name: "games.gg – Best weapons tier list",
    url: "https://games.gg/phantom-blade-0/guides/best-phantom-blade-0-weapons-tier-list/",
    nature: "ranking",
    independenceGroup: "gamesgg-main-editorial",
    methodology: "S/A/B editorial tiers emphasizing repeatable combat advantages.",
  },
  {
    id: "keen-edge",
    name: "KeenGamer – Best Phantom Edges Tier List",
    url: "https://www.keengamer.com/articles/guides/phantom-blade-zero-best-phantom-edges-tier-list/",
    nature: "ranking",
    independenceGroup: "keengamer-edge-editorial",
    methodology: "S/A/B editorial tiers for general combat usefulness and versatility.",
  },
  {
    id: "allthings-edge-stats",
    name: "AllThingsHow – Phantom Edges ranked by card stats",
    url: "https://allthings.how/phantom-blade-zero-best-phantom-edges/",
    nature: "ranking",
    independenceGroup: "allthings-card-stat-ordinal",
    methodology: "Nine verified Phantom Edges ordered by level-1 card Damage.",
  },
  {
    id: "pushsquare-weapons",
    name: "Push Square – Best Weapons and Where to Find Them",
    url: "https://www.pushsquare.com/guides/phantom-blade-zero-best-weapons-and-where-to-find-them",
    nature: "supporting",
  },
  {
    id: "allthings-weapons",
    name: "AllThingsHow – Weapons and Phantom Edges list",
    url: "https://allthings.how/phantom-blade-zero-weapons-list/",
    nature: "supporting",
  },
];

const mainSPlacements = [
  { sourceId: "keen-main", method: "tier", tier: "S" },
  { sourceId: "gamesgg-main", method: "tier", tier: "S" },
] as const satisfies readonly SourcePlacement[];

const mainWeapons: readonly RankingEntity[] = [
  {
    id: "jagged-steel",
    name: "Jagged Steel",
    kind: "main_weapon",
    category: "Status / Bleed",
    bestFor: ["Bleed-capable bosses", "Early progression", "Sustained damage"],
    easeOfUse: "Easy",
    strengths: ["Builds Bleed into Blood Loss", "Simple attack rhythm with sustained pressure"],
    limitations: [
      "Bleed has enemy-type restrictions",
      "Guard breaking is weaker than dedicated shield-breaking options",
    ],
    whyThisTier:
      "Both independent launch tier lists place Jagged Steel in S and converge on repeatable Bleed pressure and strong boss damage.",
    acquisition: "Defeat Jagged Steel, the Frenzied Brute, in Weeping Creek Valley.",
    mechanics: ["Bleed Gauge", "Blood Blade", "Jagged Steel Rampage"],
    placements: mainSPlacements,
  },
  {
    id: "white-serpent-crimson-viper",
    name: "White Serpent & Crimson Viper",
    kind: "main_weapon",
    category: "Aggressive / Dual-Wield",
    bestFor: ["Long combos", "Group pressure", "Ranged executions"],
    easeOfUse: "Medium",
    strengths: ["Continuous Twin Serpent Dance pressure", "Close-range strings plus ranged utility"],
    limitations: ["Short-range combo starters", "Strong techniques consume Sha-Chi quickly"],
    whyThisTier:
      "KeenGamer and games.gg independently place the pair in S, emphasizing sustained pressure, combo versatility, and ranged utility.",
    acquisition: "Defeat Bai Chilian and claim the weapon after the Crimson Forest encounter.",
    mechanics: ["Twin Serpent Dance", "Crimson Viper Orbit", "Ranged Execution"],
    placements: mainSPlacements,
  },
  {
    id: "fiend-saws",
    name: "Fiend Saws",
    kind: "main_weapon",
    category: "Burst / Dual-Wield",
    bestFor: ["Guard-break burst", "Fast pressure", "Boss damage windows"],
    easeOfUse: "Easy",
    strengths: ["Fast multi-hit strings", "Fiend Form turns a guard break into a high-damage window"],
    limitations: ["Best payoff depends on creating the right opening", "Fiend Form is time-limited"],
    whyThisTier:
      "Both qualifying tier sources rate Fiend Saws S and separately point to its fast pressure plus burst once a target is guard-broken.",
    acquisition:
      "Earned from Mu Xiaokui’s Village of Lu encounter after satisfying its weapon requirements.",
    mechanics: ["Fiend-Aura Erosion", "Fiend Form", "Unblockable burst window"],
    placements: mainSPlacements,
  },
  {
    id: "freezing-chaos",
    name: "Freezing Chaos",
    kind: "main_weapon",
    category: "Versatile / Form-Switching",
    bestFor: ["Adapting to encounter needs", "Elemental pressure", "Late-game versatility"],
    easeOfUse: "Needs Review",
    strengths: ["Steel, Chaos, and Frost forms cover different jobs", "Can switch between pressure, control, and guard damage"],
    limitations: ["Requires substantial progression", "Form management adds execution overhead"],
    whyThisTier:
      "The two independent launch tier lists both place Freezing Chaos in S because its three forms cover multiple encounter needs.",
    acquisition: "Defeat Yucong, No. 34 Twisted Puppet, through the Triple Threat questline.",
    mechanics: ["Threefold Shift", "Steel form", "Chaos form", "Frost form"],
    placements: mainSPlacements,
  },
  {
    id: "soft-snake-sword",
    name: "Soft Snake Sword",
    kind: "main_weapon",
    category: "Defensive / Counter",
    bestFor: ["Precise counters", "Boss duels", "Sha-Chi-efficient defense"],
    easeOfUse: "Hard",
    strengths: ["Guard stance does not drain Sha-Chi", "High-value deflection and counter tools"],
    limitations: ["Steep timing requirement", "Standard attacks have limited reach"],
    whyThisTier:
      "Both ranking sources put Soft Snake Sword in S, citing defensive resource efficiency and high-value counters.",
    acquisition: "Defeat Wu Lengshuang, the Soft Sword, in Mandate Encampment.",
    mechanics: ["Guard Stance", "Serpentine Reversal", "Wild Serpent Dance"],
    placements: mainSPlacements,
  },
  {
    id: "seamless-death",
    name: "Seamless Death",
    kind: "main_weapon",
    category: "Ranged / Dual-Wield",
    bestFor: ["Thrown-ring pressure", "Mobility", "Tracking projectiles"],
    easeOfUse: "Needs Review",
    strengths: ["Flying Rings can track locked targets", "Reaping Rings creates distance while attacking"],
    limitations: ["Only one qualifying independent tier source currently covers it", "Formal consensus cannot be calculated yet"],
    whyThisTier:
      "KeenGamer places Seamless Death in A, but games.gg does not rate it. TierListBase therefore keeps it Pending instead of treating the missing placement as zero.",
    acquisition: "Defeat Jade-Face near The Lady’s Shrine in Mountain of Imprisonment.",
    mechanics: ["Flying Rings", "Reaping Rings", "Phantom Step"],
    placements: [{ sourceId: "keen-main", method: "tier", tier: "A" }],
  },
  {
    id: "parting-hooks",
    name: "Parting Hooks",
    kind: "main_weapon",
    category: "Defensive / Counter",
    bestFor: ["Automatic counters", "Blockable boss strings", "Defensive play"],
    easeOfUse: "Medium",
    strengths: ["Guard Stance can answer eligible melee attacks", "Strong counterattack identity"],
    limitations: ["Does not answer every attack type", "Still requires correct defensive judgment"],
    whyThisTier:
      "KeenGamer and games.gg both place Parting Hooks in S and highlight Guard Stance as a reliable counter-focused advantage.",
    acquisition: "Defeat Shadow Warden Soulclaimer in Pangzhen.",
    mechanics: ["Guard Stance", "Automatic counter", "Peerless Hook"],
    placements: mainSPlacements,
  },
];

const phantomEdges: readonly RankingEntity[] = [
  {
    id: "thunder-spear",
    name: "Thunder Spear",
    kind: "phantom_edge",
    category: "Martial",
    bestFor: ["Raw card damage", "Lightning pressure", "Status-oriented offense"],
    easeOfUse: "Needs Review",
    strengths: ["Highest level-1 Damage in the nine-edge card-stat sample", "KeenGamer rates it a strong A-tier option"],
    limitations: ["Raw card Damage does not capture total utility or encounter coverage"],
    whyThisTier:
      "KeenGamer rates Thunder Spear A while the independent card-stat source ranks it 1st of 9 by Damage. The combined signals clear the S threshold without a large methodological conflict.",
    acquisition: "Obtained in Pangzhen from Chang Hong according to the launch ranking guide.",
    mechanics: ["Lightning attacks", "Status Effects", "Elemental pressure"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 1, fieldSize: 9 },
    ],
  },
  {
    id: "fire-meteor",
    name: "Fire Meteor",
    kind: "phantom_edge",
    category: "Martial",
    bestFor: ["High damage", "Status effects", "Boss pressure"],
    easeOfUse: "Needs Review",
    strengths: ["Second-highest card Damage in the verified nine-edge sample", "A-tier editorial assessment"],
    limitations: ["Damage ordering alone does not measure defensive or traversal utility"],
    whyThisTier:
      "Fire Meteor is A in KeenGamer and 2nd of 9 by raw card Damage in AllThingsHow. Those two independent signals produce an A consensus.",
    acquisition: "Defeat Blaze in Pangzhen according to the launch ranking guide.",
    mechanics: ["Phosphor Flame", "Status damage", "Attack weakening"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 2, fieldSize: 9 },
    ],
  },
  {
    id: "dread-axe",
    name: "Dread Axe",
    kind: "phantom_edge",
    category: "Destructive",
    bestFor: ["Shield breaking", "Early progression", "Opening chained routes"],
    easeOfUse: "Needs Review",
    strengths: ["High shield-breaking value", "Third-highest Damage in the nine-edge card-stat sample", "Iron Chain Breaker has exploration utility"],
    limitations: ["Heavy committed attacks are less flexible than faster options"],
    whyThisTier:
      "Dread Axe is A in KeenGamer and 3rd of 9 by raw card Damage. The two independent methods agree that it is a strong option.",
    acquisition: "Defeat Peng Meng, the Axemaster, in Weeping Creek Valley.",
    mechanics: ["Charged cleave", "Iron Chain Breaker", "High Shield-Breaking power"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 3, fieldSize: 9 },
    ],
  },
  {
    id: "heartrend-pipa",
    name: "Heartrend Pipa",
    kind: "phantom_edge",
    category: "Artifice",
    bestFor: ["Sonic projectiles", "Mid-range pressure", "Guard damage"],
    easeOfUse: "Needs Review",
    strengths: ["Ranks 4th of 9 on verified card Damage", "Provides sonic projectile utility"],
    limitations: ["KeenGamer rates its overall combat value B", "Later progression can replace its niche"],
    whyThisTier:
      "The card-stat source places Heartrend Pipa 4th of 9, while KeenGamer gives it B for general usefulness. The normalized consensus remains B.",
    acquisition: "Defeat Yuzan in Village of Lu according to the launch guide.",
    mechanics: ["Sonic Blades", "Mid-range projectiles", "Artifice utility"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "B" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 4, fieldSize: 9 },
    ],
  },
  {
    id: "wolfjaw",
    name: "Wolfjaw",
    kind: "phantom_edge",
    category: "Destructive",
    bestFor: ["Guard Break", "Lifesteal", "Sustained combat"],
    easeOfUse: "Needs Review",
    strengths: ["Highest Guard Break card value in the nine-edge sample", "Editorial A tier for sustained combat"],
    limitations: ["Raw Damage sits mid-pack", "Lifesteal usefulness depends on susceptible enemies"],
    whyThisTier:
      "Wolfjaw is A in KeenGamer and 5th of 9 by Damage, while also leading the sample in Guard Break. The normalized result remains A.",
    acquisition: "Defeat Wu Xuan in Pangzhen according to launch guides.",
    mechanics: ["Guard Break", "Lifesteal", "Heavy melee pressure"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 5, fieldSize: 9 },
    ],
  },
  {
    id: "iron-gauntlets",
    name: "Iron Gauntlets",
    kind: "phantom_edge",
    category: "Martial",
    bestFor: ["Fast combos", "Breaking shields", "Armored enemies"],
    easeOfUse: "Needs Review",
    strengths: ["KeenGamer places it in S", "Fist Focus supports aggressive primary-weapon follow-up"],
    limitations: ["Only 6th of 9 by raw card Damage", "Short reach requires close commitment"],
    whyThisTier:
      "KeenGamer’s S-tier utility assessment and the card-stat source’s 6th-of-9 Damage placement diverge beyond the review threshold. TierListBase therefore does not publish a final tier yet.",
    acquisition: "Defeat Stone Hand Iron Fever in Crimson Forest.",
    mechanics: ["Fist Focus", "Shield breaking", "Fast multi-hit attacks"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 6, fieldSize: 9 },
    ],
  },
  {
    id: "flaming-mane",
    name: "Flaming Mane",
    kind: "phantom_edge",
    category: "Artifice",
    bestFor: ["Crowd control", "Fire damage", "Burning blocked routes"],
    easeOfUse: "Needs Review",
    strengths: ["KeenGamer rates it S for combat plus exploration value", "Wide fire coverage helps groups"],
    limitations: ["Only 7th of 9 by raw card Damage", "Elemental value is not represented well by a damage-only ordering"],
    whyThisTier:
      "The S-tier utility assessment and 7th-of-9 raw Damage placement measure different strengths and conflict beyond the preset threshold, so the entity remains Needs Review.",
    acquisition: "Earned through the Flaming Mane boss and repair sequence in Pangzhen.",
    mechanics: ["Fire breath", "Crowd control", "Burning Path traversal"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 7, fieldSize: 9 },
    ],
  },
  {
    id: "hunters-chain-sickle",
    name: "Hunter’s Chain Sickle",
    kind: "phantom_edge",
    category: "Martial",
    bestFor: ["Gap closing", "Mobility", "Traversal"],
    easeOfUse: "Needs Review",
    strengths: ["KeenGamer calls it the best all-around Phantom Edge", "Medium-to-long range attacks and grappling add utility"],
    limitations: ["Only 8th of 9 by raw card Damage", "Its value comes from mobility more than card damage"],
    whyThisTier:
      "KeenGamer’s S-tier all-around utility verdict conflicts sharply with an 8th-of-9 raw Damage placement. Because the methods disagree materially, TierListBase marks it Needs Review.",
    acquisition: "Defeat The Hunt in Weeping Creek Valley.",
    mechanics: ["Chain-sickle attacks", "Gap closing", "Grappling Traverse"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 8, fieldSize: 9 },
    ],
  },
  {
    id: "bastion",
    name: "Bastion",
    kind: "phantom_edge",
    category: "Artifice",
    bestFor: ["Blocking", "Damage absorption", "Counterattacks"],
    easeOfUse: "Needs Review",
    strengths: ["Editorial A-tier defensive value", "Can convert absorbed pressure into a counterattack"],
    limitations: ["9th of 9 by raw card Damage", "Damage-only ordering undervalues defensive function"],
    whyThisTier:
      "Bastion is A for general defensive utility but 9th of 9 on the damage-only card ranking. The normalized sources conflict beyond the review threshold, so no final tier is claimed.",
    acquisition:
      "Village of Lu boss reward; secondary sources differ on the boss-name spelling, so that detail remains under review.",
    mechanics: ["Blocking", "Damage absorption", "Counterattack"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "allthings-edge-stats", method: "ordinal", rank: 9, fieldSize: 9 },
    ],
  },
];

const tierScore: Readonly<Record<Tier, number>> = { S: 1, A: 0.7, B: 0.4, C: 0.1 };

function normalizePlacement(placement: SourcePlacement): number {
  if (placement.method === "tier") return tierScore[placement.tier];
  if (placement.fieldSize <= 1) return 1;
  return 1 - (placement.rank - 1) / (placement.fieldSize - 1);
}

function scoreToTier(score: number): Tier {
  if (score >= 0.8) return "S";
  if (score >= 0.6) return "A";
  if (score >= 0.4) return "B";
  return "C";
}

export function reviewPhantomBladeZeroEntity(entity: RankingEntity): ReviewedRankingEntity {
  const rankingSources = entity.placements
    .map((placement) => phantomBladeZeroSources.find((source) => source.id === placement.sourceId))
    .filter((source): source is RankingSource => Boolean(source && source.nature === "ranking"));

  const independentSourceCount = new Set(
    rankingSources.map((source) => source.independenceGroup ?? source.id),
  ).size;

  if (independentSourceCount < 2) {
    return {
      ...entity,
      independentSourceCount,
      consensusTier: null,
      finalTier: "Pending",
      disagreement: false,
    };
  }

  const normalized = entity.placements.map(normalizePlacement);
  const mean = normalized.reduce((sum, value) => sum + value, 0) / normalized.length;
  const disagreement = Math.max(...normalized) - Math.min(...normalized) >= 0.5;
  const consensusTier = scoreToTier(mean);

  if (entity.override) {
    if (!entity.override.reason.trim() || entity.override.supportingEvidence.length === 0) {
      throw new Error(`Override for ${entity.id} requires a reason and supporting evidence`);
    }
    return {
      ...entity,
      independentSourceCount,
      consensusTier,
      finalTier: entity.override.finalTier,
      disagreement,
    };
  }

  return {
    ...entity,
    independentSourceCount,
    consensusTier,
    finalTier: disagreement ? "Needs Review" : consensusTier,
    disagreement,
  };
}

const reviewedMainWeapons = mainWeapons.map(reviewPhantomBladeZeroEntity);
const reviewedPhantomEdges = phantomEdges.map(reviewPhantomBladeZeroEntity);

export const phantomBladeZeroSnapshot = {
  snapshotDate: "2026-11-03",
  releaseVersion: "Launch snapshot",
  officialScale: {
    mainWeapons: "30+",
    phantomEdges: 25,
    note:
      "Official scale is not TierListBase coverage. Only entities with verified identity and sufficient source evidence are included below.",
  },
  sources: phantomBladeZeroSources,
  mainWeapons: reviewedMainWeapons,
  phantomEdges: reviewedPhantomEdges,
  quickPicks: [
    {
      label: "Boss Bleed Pick",
      entityId: "jagged-steel",
      reason: "Both independent main-weapon tier sources place it in S for repeatable Bleed pressure.",
    },
    {
      label: "Defensive Pick",
      entityId: "soft-snake-sword",
      reason: "Both sources place it in S and specifically value its counter-focused defense.",
    },
    {
      label: "Early Phantom Edge",
      entityId: "dread-axe",
      reason: "A consensus plus 3rd-of-9 raw card Damage and useful chain-breaking traversal.",
    },
    {
      label: "Raw-Damage Phantom Edge",
      entityId: "thunder-spear",
      reason: "Ranks 1st of 9 by verified level-1 card Damage while remaining A in editorial utility.",
    },
  ] as const,
  whatChanged:
    "First TierListBase snapshot. No previous verified snapshot exists, so no tier movements are claimed.",
} as const;

export function getPhantomBladeZeroReleaseReadiness() {
  const required = phantomBladeZeroAssetProvenance.filter((asset) => asset.required === "P0");
  const verified = required.filter(
    (asset) =>
      asset.status === "verified_local" &&
      Boolean(asset.localPath) &&
      Boolean(asset.sha256) &&
      Boolean(asset.originalDimensions) &&
      Boolean(asset.outputDimensions),
  );
  const verifiedIds = new Set(verified.map((asset) => asset.id));
  const missing = required.filter((asset) => !verifiedIds.has(asset.id));

  return {
    ready: missing.length === 0,
    required: required.length,
    verified: verified.length,
    missing: missing.map((asset) => asset.id),
  } as const;
}
