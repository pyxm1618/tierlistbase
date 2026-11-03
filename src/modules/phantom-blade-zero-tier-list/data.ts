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
    independenceGroup: "keengamer",
    methodology: "S/A/B editorial tiers based on practical combat performance.",
  },
  {
    id: "gamesgg-main",
    name: "games.gg – Best weapons tier list",
    url: "https://games.gg/phantom-blade-0/guides/best-phantom-blade-0-weapons-tier-list/",
    nature: "ranking",
    independenceGroup: "gamesgg",
    methodology: "S/A/B editorial tiers emphasizing repeatable combat advantages.",
  },
  {
    id: "keen-edge",
    name: "KeenGamer – Best Phantom Edges Tier List",
    url: "https://www.keengamer.com/articles/guides/phantom-blade-zero-best-phantom-edges-tier-list/",
    nature: "ranking",
    independenceGroup: "keengamer",
    methodology: "S/A/B editorial tiers for general combat usefulness and versatility.",
  },
  {
    id: "gamesgg-edge",
    name: "games.gg – Phantom Edge recommendations",
    url: "https://games.gg/phantom-blade-0/guides/best-phantom-blade-0-weapons-tier-list/",
    nature: "ranking",
    independenceGroup: "gamesgg",
    methodology: "S/A Phantom Edge table embedded in the post-launch weapons guide.",
  },
  {
    id: "allthings-edge-stats",
    name: "AllThingsHow – Phantom Edges ranked by card stats",
    url: "https://allthings.how/phantom-blade-zero-best-phantom-edges/",
    nature: "ranking",
    independenceGroup: "allthingshow",
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

const mainAPlacements = [
  { sourceId: "keen-main", method: "tier", tier: "A" },
  { sourceId: "gamesgg-main", method: "tier", tier: "A" },
] as const satisfies readonly SourcePlacement[];

const mainBPlacements = [
  { sourceId: "keen-main", method: "tier", tier: "B" },
  { sourceId: "gamesgg-main", method: "tier", tier: "B" },
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
    strengths: [
      "Continuous Twin Serpent Dance pressure",
      "Close-range strings plus ranged utility",
    ],
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
    strengths: [
      "Fast multi-hit strings",
      "Fiend Form turns a guard break into a high-damage window",
    ],
    limitations: [
      "Best payoff depends on creating the right opening",
      "Fiend Form is time-limited",
    ],
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
    strengths: [
      "Steel, Chaos, and Frost forms cover different jobs",
      "Can switch between pressure, control, and guard damage",
    ],
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
    strengths: [
      "Flying Rings can track locked targets",
      "Reaping Rings creates distance while attacking",
    ],
    limitations: [
      "Only one qualifying independent tier source currently covers it",
      "Formal consensus cannot be calculated yet",
    ],
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
  {
    id: "scarlet-wraithblade",
    name: "Scarlet Wraithblade",
    kind: "main_weapon",
    category: "Two-Handed / Area Control",
    bestFor: ["Area control", "Sha-Chi depletion", "Grouped enemies"],
    easeOfUse: "Medium",
    strengths: [
      "Red Spider Lilies slow enemies and drain Sha-Chi",
      "Delayed flower explosions add area pressure",
    ],
    limitations: [
      "Slow combo finishers need deliberate openings",
      "Area effects are strongest when enemies stay inside them",
    ],
    whyThisTier:
      "Both independent launch tier lists place Scarlet Wraithblade in A, valuing its area control and Sha-Chi pressure while noting its slower commitments.",
    acquisition: "Defeat Hua, Deadly Betrothed, at Flesh Lily Fields in Weeping Creek Valley.",
    mechanics: ["Red Spider Lilies", "Rouge Bloomstorm", "Delayed area explosions"],
    placements: mainAPlacements,
  },
  {
    id: "baishan-stormswords",
    name: "Baishan Stormswords",
    kind: "main_weapon",
    category: "Dual-Wield / Elemental",
    bestFor: ["Wind and Thunder buildup", "Temporary damage buffs", "Aggressive combos"],
    easeOfUse: "Medium",
    strengths: [
      "Builds separate Wind and Thunder gauges",
      "Filling both activates a temporary attack-power buff",
    ],
    limitations: [
      "Peak value depends on filling both elemental gauges",
      "Needs sustained pressure before its buff comes online",
    ],
    whyThisTier:
      "KeenGamer and games.gg both rate Baishan Stormswords A for elemental buildup and temporary damage amplification.",
    acquisition: "Defeat Yubi, the No. 21 Swordfighter Puppet, in Mandate Encampment.",
    mechanics: ["Wind Gauge", "Thunder Gauge", "Baishan’s Blessing"],
    placements: mainAPlacements,
  },
  {
    id: "sundering-dual-axes",
    name: "Sundering Dual Axes",
    kind: "main_weapon",
    category: "Dual-Wield / Sustained Damage",
    bestFor: ["Sustained damage", "Lingering attacks", "Sha-Chi depletion"],
    easeOfUse: "Medium",
    strengths: [
      "Normal attacks build Baleful Aura",
      "Thrown axes can remain attached and keep damaging targets",
    ],
    limitations: [
      "Its payoff needs repeated attacks to build",
      "Less immediate than burst-focused weapons",
    ],
    whyThisTier:
      "Both independent tier lists place Sundering Dual Axes in A, emphasizing Baleful Aura and lingering damage as strong but setup-dependent tools.",
    acquisition: "Defeat Shadow Warden Heartpiercer at White Serpent House in Meigu Lake.",
    mechanics: ["Baleful Aura", "Lingering thrown axes", "Sha-Chi depletion"],
    placements: mainAPlacements,
  },
  {
    id: "whiteshadow",
    name: "Whiteshadow",
    kind: "main_weapon",
    category: "Two-Handed / Ice",
    bestFor: ["Chill buildup", "Freezing enemies", "Elemental control"],
    easeOfUse: "Medium",
    strengths: ["Builds Chill reliably", "Frosthowl can guarantee Frozen on enemies it hits"],
    limitations: [
      "Access requires four Acolyte Masks and a secret encounter",
      "Its value is tied to elemental control rather than universal burst",
    ],
    whyThisTier:
      "Both launch tier sources place Whiteshadow in A for dependable Chill and freezing control, with acquisition complexity as a practical limitation.",
    acquisition:
      "Defeat the Blizzard Blademaster in the secret Meigu Lake mountain area after collecting four Acolyte Masks.",
    mechanics: ["Chill buildup", "Frozen Gauge", "Whiteshadow’s Frosthowl"],
    placements: mainAPlacements,
  },
  {
    id: "juggernaut",
    name: "Juggernaut",
    kind: "main_weapon",
    category: "Two-Handed / Parry",
    bestFor: ["Parry-focused play", "Heavy punish windows", "Guard breaking"],
    easeOfUse: "Hard",
    strengths: ["Successful parries build Red Edge stacks", "Stacks can be spent on heavy damage"],
    limitations: [
      "Best output depends on consistent parry timing",
      "Less forgiving if you avoid defensive timing mechanics",
    ],
    whyThisTier:
      "KeenGamer and games.gg both place Juggernaut in A because it converts successful parries into powerful heavy attacks.",
    acquisition: "Defeat Bi Feng, the Giant Saber Commander, in Mountain of Imprisonment.",
    mechanics: ["Red Edge stacks", "Parry conversion", "Bandit-Slaying Rampage"],
    placements: mainAPlacements,
  },
  {
    id: "outlaw-warblade",
    name: "Outlaw Warblade",
    kind: "main_weapon",
    category: "Two-Handed / Lifesteal",
    bestFor: ["Sustain", "HP recovery", "Long melee exchanges"],
    easeOfUse: "Medium",
    strengths: ["Standard attacks can restore HP", "Power Surge can drain health from an enemy"],
    limitations: [
      "Heavy attacks spend HP",
      "Some enemy types resist lifesteal without supporting gear",
    ],
    whyThisTier:
      "Both independent sources rate Outlaw Warblade A for sustained melee healing, balanced by HP-cost mechanics and enemy-type restrictions.",
    acquisition: "Defeat Jing Ye, the Outlaw, in Crimson Forest.",
    mechanics: ["Lifesteal", "Bloodthirst Frenzy", "HP-cost heavy attacks"],
    placements: mainAPlacements,
  },
  {
    id: "wooden-sanguine",
    name: "Wooden Sanguine",
    kind: "main_weapon",
    category: "One-Handed / Guard Break",
    bestFor: ["Early bosses", "Parry practice", "Breaking guards before swapping"],
    easeOfUse: "Medium",
    strengths: [
      "Strong early Guard Break utility",
      "Pairs well with a damage weapon after the enemy guard breaks",
    ],
    limitations: [
      "Its main job is opening a damage window rather than finishing it",
      "Later weapons offer broader specialist mechanics",
    ],
    whyThisTier:
      "Both launch tier lists rate Wooden Sanguine A as an unusually useful early guard-breaking and parry-focused support weapon.",
    acquisition: "Received during the tutorial.",
    mechanics: ["Guard Break", "Parry pressure", "Weapon-swap setup"],
    placements: mainAPlacements,
  },
  {
    id: "armybreaker",
    name: "Armybreaker",
    kind: "main_weapon",
    category: "Two-Handed / Guard Break",
    bestFor: ["Sha-Chi damage", "Gap closing", "Formation breaking"],
    easeOfUse: "Medium",
    strengths: [
      "Switching to it or parrying a Blue Flash can trigger a forward rush",
      "Formation Breaking Art deals substantial Sha-Chi damage",
    ],
    limitations: [
      "Its strongest advantages favor guard-breaking play",
      "Less flexible when raw damage is the only priority",
    ],
    whyThisTier:
      "KeenGamer and games.gg both place Armybreaker in A for dependable Sha-Chi pressure and gap-closing utility.",
    acquisition: "Defeat Shadow Warden Cavalrybane in the Pangzhen marketplace.",
    mechanics: ["Forward rush", "Formation Breaking Art", "Sha-Chi depletion"],
    placements: mainAPlacements,
  },
  {
    id: "wild-oriole-sword",
    name: "Wild Oriole Sword",
    kind: "main_weapon",
    category: "One-Handed / Blade Waves",
    bestFor: ["Aggressive combos", "Mid-range pressure", "Extending heavy attacks"],
    easeOfUse: "Medium",
    strengths: [
      "Oriole Song lets heavy attacks release blade waves",
      "Adds temporary reach to an aggressive one-handed moveset",
    ],
    limitations: [
      "Its defining blade-wave state lasts for a limited window",
      "Requires the additional Mu Xiaokui boss phase",
    ],
    whyThisTier:
      "Both independent ranking sources place Wild Oriole Sword in A for temporary blade-wave reach and aggressive combo pressure.",
    acquisition: "Earn it through Mu Xiaokui’s additional boss phase in Village of Lu.",
    mechanics: ["Oriole Song", "Blade waves", "10-second enhanced state"],
    placements: mainAPlacements,
  },
  {
    id: "the-fanatics-broken-blade",
    name: "The Fanatic’s Broken Blade",
    kind: "main_weapon",
    category: "One-Handed / Drunken Sword",
    bestFor: ["Long-range sword attacks", "Sha-Chi recovery", "Prepared burst windows"],
    easeOfUse: "Hard",
    strengths: [
      "Drinking restores Sha-Chi",
      "Tipsy and Drunk states convert attacks into flying sword strikes",
    ],
    limitations: [
      "Drinking creates vulnerable setup windows",
      "Drunk state restricts mobility and disables normal blocking",
    ],
    whyThisTier:
      "Both independent tier lists place The Fanatic’s Broken Blade in B because its range can be valuable, but setup and movement restrictions reduce consistency.",
    acquisition: "Defeat Hua Qianxiao, the Sword Fanatic, in Crimson Forest.",
    mechanics: ["Bottomless Drink", "Tipsy state", "Drunk state"],
    placements: mainBPlacements,
  },
  {
    id: "sanguine-twin",
    name: "Sanguine Twin",
    kind: "main_weapon",
    category: "Dual-Wield / Beginner",
    bestFor: ["Fast early combos", "Learning dual-wield pressure", "Early aggression"],
    easeOfUse: "Easy",
    strengths: ["Fast repeated slashes", "Accessible early in progression"],
    limitations: [
      "Short reach at the start of combos",
      "Later dual-wield weapons offer stronger specialist mechanics",
    ],
    whyThisTier:
      "Both launch tier lists place Sanguine Twin in B: it is fast and accessible, but short reach and limited specialization reduce late-game priority.",
    acquisition:
      "Found on a weapon rack below the First Meeting with Yu’er bell in Weeping Creek Valley.",
    mechanics: ["Dual-Blade Flurry", "Fast multi-hit strings", "Short-range starters"],
    placements: mainBPlacements,
  },
  {
    id: "sanguine-reach",
    name: "Sanguine Reach",
    kind: "main_weapon",
    category: "Two-Handed / Reach",
    bestFor: ["Crowd handling", "Long-reaching attacks", "Simple early pressure"],
    easeOfUse: "Easy",
    strengths: ["Wide reach helps against groups", "Straightforward sweeping attack pattern"],
    limitations: [
      "Later two-handed weapons offer more distinctive effects",
      "Its damage-buff value requires additional management",
    ],
    whyThisTier:
      "KeenGamer and games.gg both place Sanguine Reach in B as a dependable early crowd option that is eventually outclassed by more specialized weapons.",
    acquisition: "Found on the weapon rack beside Forge at the Weeping Creek Valley Outpost.",
    mechanics: ["Longblade Chain Strikes", "Wide sweeping attacks", "Temporary damage buffs"],
    placements: mainBPlacements,
  },
  {
    id: "sanguine",
    name: "Sanguine",
    kind: "main_weapon",
    category: "One-Handed / Beginner",
    bestFor: ["Learning combat", "Reliable basic combos", "Early progression"],
    easeOfUse: "Easy",
    strengths: ["Straightforward attacks", "Useful starting moveset with little setup"],
    limitations: [
      "Specialized weapons provide stronger offensive or defensive advantages later",
      "Later perks improve less dramatically than competing options",
    ],
    whyThisTier:
      "Both independent launch tier lists place Sanguine in B: it is reliable for learning the game, but later weapons offer more impactful mechanics.",
    acquisition: "Soul’s default starting weapon.",
    mechanics: ["Sweeping Blade", "Straightforward combos", "Beginner-friendly pressure"],
    placements: mainBPlacements,
  },
  {
    id: "tianxuan-bronze-sword",
    name: "Tianxuan Bronze Sword",
    kind: "main_weapon",
    category: "One-Handed / Guard",
    bestFor: ["Blocking-focused defense", "Reduced Sha-Chi guard cost", "Defensive builds"],
    easeOfUse: "Easy",
    strengths: [
      "Reduces Sha-Chi consumption while blocking",
      "Offers high shield-breaking power for a guard-focused style",
    ],
    limitations: [
      "Normal parrying is disabled",
      "Its specialization is narrow if you prefer perfect-parry play",
    ],
    whyThisTier:
      "Both qualifying tier sources place Tianxuan Bronze Sword in B because reduced blocking costs are useful, but losing normal parries creates a major trade-off.",
    acquisition: "Obtain it from Master Bi Yuan in Village of Lu.",
    mechanics: ["Natural Order", "Reduced block cost", "No normal parry"],
    placements: mainBPlacements,
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
    strengths: [
      "Highest level-1 Damage in the nine-edge card-stat sample",
      "KeenGamer rates it a strong A-tier option",
    ],
    limitations: ["Raw card Damage does not capture total utility or encounter coverage"],
    whyThisTier:
      "KeenGamer rates Thunder Spear A while the independent card-stat source ranks it 1st of 9 by Damage. The combined signals clear the S threshold without a large methodological conflict.",
    acquisition: "Obtained in Pangzhen from Chang Hong according to the launch ranking guide.",
    mechanics: ["Lightning attacks", "Status Effects", "Elemental pressure"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "A" },
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
    strengths: [
      "Second-highest card Damage in the verified nine-edge sample",
      "A-tier editorial assessment",
    ],
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
    strengths: [
      "High shield-breaking value",
      "Third-highest Damage in the nine-edge card-stat sample",
      "Iron Chain Breaker has exploration utility",
    ],
    limitations: ["Heavy committed attacks are less flexible than faster options"],
    whyThisTier:
      "Dread Axe is A in KeenGamer and 3rd of 9 by raw card Damage. The two independent methods agree that it is a strong option.",
    acquisition: "Defeat Peng Meng, the Axemaster, in Weeping Creek Valley.",
    mechanics: ["Charged cleave", "Iron Chain Breaker", "High Shield-Breaking power"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "S" },
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
    limitations: [
      "KeenGamer rates its overall combat value B",
      "Later progression can replace its niche",
    ],
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
    strengths: [
      "Highest Guard Break card value in the nine-edge sample",
      "Editorial A tier for sustained combat",
    ],
    limitations: [
      "Raw Damage sits mid-pack",
      "Lifesteal usefulness depends on susceptible enemies",
    ],
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
    strengths: [
      "KeenGamer places it in S",
      "Fist Focus supports aggressive primary-weapon follow-up",
    ],
    limitations: ["Only 6th of 9 by raw card Damage", "Short reach requires close commitment"],
    whyThisTier:
      "KeenGamer’s S-tier utility assessment and the card-stat source’s 6th-of-9 Damage placement diverge beyond the review threshold. TierListBase therefore does not publish a final tier yet.",
    acquisition: "Defeat Stone Hand Iron Fever in Crimson Forest.",
    mechanics: ["Fist Focus", "Shield breaking", "Fast multi-hit attacks"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "S" },
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
    strengths: [
      "KeenGamer rates it S for combat plus exploration value",
      "Wide fire coverage helps groups",
    ],
    limitations: [
      "Only 7th of 9 by raw card Damage",
      "Elemental value is not represented well by a damage-only ordering",
    ],
    whyThisTier:
      "The S-tier utility assessment and 7th-of-9 raw Damage placement measure different strengths and conflict beyond the preset threshold, so the entity remains Needs Review.",
    acquisition: "Earned through the Flaming Mane boss and repair sequence in Pangzhen.",
    mechanics: ["Fire breath", "Crowd control", "Burning Path traversal"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "A" },
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
    strengths: [
      "KeenGamer calls it the best all-around Phantom Edge",
      "Medium-to-long range attacks and grappling add utility",
    ],
    limitations: [
      "Only 8th of 9 by raw card Damage",
      "Its value comes from mobility more than card damage",
    ],
    whyThisTier:
      "KeenGamer’s S-tier all-around utility verdict conflicts sharply with an 8th-of-9 raw Damage placement. Because the methods disagree materially, TierListBase marks it Needs Review.",
    acquisition: "Defeat The Hunt in Weeping Creek Valley.",
    mechanics: ["Chain-sickle attacks", "Gap closing", "Grappling Traverse"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "A" },
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
    strengths: [
      "Editorial A-tier defensive value",
      "Can convert absorbed pressure into a counterattack",
    ],
    limitations: [
      "9th of 9 by raw card Damage",
      "Damage-only ordering undervalues defensive function",
    ],
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
  {
    id: "kuye-temple-prayer-beads",
    name: "Kuye Temple Prayer Beads",
    kind: "phantom_edge",
    category: "Summon / Support",
    bestFor: ["Summoned allies", "Sustained pressure", "Distracting enemies"],
    easeOfUse: "Easy",
    strengths: [
      "Summons three Bronze Men to fight alongside Soul",
      "Tempering upgrades the summons into specialized Gold Men",
    ],
    limitations: [
      "Summon value depends on encounter duration",
      "Less direct control than immediate-damage Phantom Edges",
    ],
    whyThisTier:
      "KeenGamer and games.gg independently place Kuye Temple Prayer Beads in S, converging on the value of its three combat summons and strong tempered upgrade path.",
    acquisition: "Defeat Master Bi Hai of Kuye Temple in Village of Lu.",
    mechanics: ["Three Bronze Men summons", "Tempered Gold Men", "Persistent ally pressure"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "S" },
    ],
  },
  {
    id: "inanis-radiant-fan",
    name: "Inanis’ Radiant Fan",
    kind: "phantom_edge",
    category: "Summon / Support",
    bestFor: ["Boss survivability", "Recovery", "Defensive safety"],
    easeOfUse: "Easy",
    strengths: [
      "Creates a sanctuary field",
      "Tempering can revive Soul once at 30% HP after fatal damage inside the field",
    ],
    limitations: [
      "Defensive value is lower when survivability is not the limiting factor",
      "Revival resets only after a Bell or respawn",
    ],
    whyThisTier:
      "Both independent editorial sources rank Inanis’ Radiant Fan in S, emphasizing its unusually strong recovery and survivability utility.",
    acquisition:
      "Complete Whence the Weeping in Mountain of Imprisonment and claim the reward associated with Inanis.",
    mechanics: ["Sanctuary field", "Nirvana revival", "Recovery support"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "S" },
    ],
  },
  {
    id: "puppeteers-bell",
    name: "Puppeteer’s Bell",
    kind: "phantom_edge",
    category: "Summon / Support",
    bestFor: ["Summoned distractions", "Defensive pressure relief", "Multi-target fights"],
    easeOfUse: "Easy",
    strengths: [
      "Commands Puppets to fight alongside Soul",
      "Tempering into Abyssal Bell can add a third powerful Puppet",
    ],
    limitations: [
      "Summons provide indirect rather than immediate burst damage",
      "Acquisition requires the Firefly Memory Flower progression condition",
    ],
    whyThisTier:
      "KeenGamer and games.gg both place Puppeteer’s Bell in A, agreeing that durable summoned Puppets provide strong distraction and support without reaching the top overall tier.",
    acquisition:
      "Defeat Dusk in Village of Lu after collecting the required six Firefly Memory Flowers.",
    mechanics: ["Puppet summons", "Abyssal Bell", "Third-Puppet tempered upgrade"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "A" },
    ],
  },
  {
    id: "feather-bow",
    name: "Feather Bow",
    kind: "phantom_edge",
    category: "Ranged",
    bestFor: ["Opening ranged damage", "Precision shots", "Exploration targets"],
    easeOfUse: "Medium",
    strengths: [
      "Reliable ranged pressure",
      "Tempering adds a timed Precision Shot with higher damage and Sha-Chi depletion",
    ],
    limitations: [
      "Requires charge timing for peak tempered output",
      "Less useful when enemies immediately force close-range combat",
    ],
    whyThisTier:
      "Both independent editorial tier sources place Feather Bow in A, valuing its reliable ranged utility and precision-shot upgrade without treating it as a universal S-tier choice.",
    acquisition: "Complete Purge the Sect in Weeping Creek Valley.",
    mechanics: ["Ranged Shot", "Precision Shot", "Charge-timing bonus"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "A" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "A" },
    ],
  },
  {
    id: "bashpole",
    name: "Bashpole",
    kind: "phantom_edge",
    category: "Melee / Heavy",
    bestFor: ["Shield breaking", "Armored enemies", "Crowd pressure"],
    easeOfUse: "Medium",
    strengths: [
      "High shield-breaking power",
      "Groundbreaker also opens weakened ground during exploration",
    ],
    limitations: [
      "Heavy attacks are more committed than faster Phantom Edges",
      "games.gg places it one tier below KeenGamer",
    ],
    whyThisTier:
      "KeenGamer ranks Bashpole S while games.gg ranks it A. The normalized consensus remains S, and the one-tier editorial disagreement stays below the Needs Review threshold.",
    acquisition: "Defeat Wan Jun, the Coppermaul, in Mandate Encampment.",
    mechanics: ["Ground-shaking heavy attacks", "Groundbreaker", "High Shield-Breaking power"],
    placements: [
      { sourceId: "keen-edge", method: "tier", tier: "S" },
      { sourceId: "gamesgg-edge", method: "tier", tier: "A" },
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
    note: "Official scale is not TierListBase coverage. Only entities with verified identity and sufficient source evidence are included below.",
  },
  sources: phantomBladeZeroSources,
  mainWeapons: reviewedMainWeapons,
  phantomEdges: reviewedPhantomEdges,
  quickPicks: [
    {
      label: "Boss Bleed Pick",
      entityId: "jagged-steel",
      reason:
        "Both independent main-weapon tier sources place it in S for repeatable Bleed pressure.",
    },
    {
      label: "Defensive Pick",
      entityId: "soft-snake-sword",
      reason: "Both sources place it in S and specifically value its counter-focused defense.",
    },
    {
      label: "Early Phantom Edge",
      entityId: "dread-axe",
      reason:
        "Two editorial rankings plus 3rd-of-9 raw card Damage support its shield-breaking value.",
    },
    {
      label: "Raw-Damage Phantom Edge",
      entityId: "thunder-spear",
      reason:
        "Ranks 1st of 9 by verified level-1 card Damage while remaining A in editorial utility.",
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
