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
    id: "mobalytics-main",
    name: "Mobalytics – Weapon Tier List – Phantom Blade Zero",
    url: "https://mobalytics.gg/gamebase/guides/phantom-blade-zero-weapon-tier-list",
    nature: "ranking",
    independenceGroup: "mobalytics",
    methodology:
      "S/A/B editorial tiers for the 30 Main Weapons with per-weapon reasoning; updated 6 November 2026.",
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
    name: "games.gg – Phantom Edge utility and unlock guide",
    url: "https://games.gg/phantom-blade-0/guides/phantom-blade-zero-phantom-edges-all-locations-unlocks-guide/",
    nature: "supporting",
    methodology:
      "Entity-level utility, unlock, and mechanics coverage; not a comprehensive Phantom Edge tier ranking.",
  },
  {
    id: "allthings-edge-stats",
    name: "AllThingsHow – Phantom Edge card stats",
    url: "https://allthings.how/phantom-blade-zero-best-phantom-edges/",
    nature: "supporting",
    methodology:
      "Objective level-1 card Damage, Guard Break, and Status Effect data only; never counted as a comprehensive Tier vote.",
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

// Every reviewed Main Weapon carries one explicit placement per independent
// ranking source, so a reader can audit the exact evidence behind each tier.
function mainWeaponPlacements(
  keenTier: Tier,
  gamesggTier: Tier,
  mobalyticsTier: Tier,
): readonly SourcePlacement[] {
  return [
    { sourceId: "keen-main", method: "tier", tier: keenTier },
    { sourceId: "gamesgg-main", method: "tier", tier: gamesggTier },
    { sourceId: "mobalytics-main", method: "tier", tier: mobalyticsTier },
  ];
}

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
      "KeenGamer and games.gg both place Jagged Steel in S, while Mobalytics rates it A. All three agree on repeatable Bleed pressure, with enemy-type immunity as the shared caveat.",
    acquisition: "Defeat Jagged Steel, the Frenzied Brute, in Weeping Creek Valley.",
    mechanics: ["Bleed Gauge", "Blood Blade", "Jagged Steel Rampage"],
    placements: mainWeaponPlacements("S", "S", "A"),
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
      "KeenGamer and games.gg place the pair in S and Mobalytics in A; all three point to sustained pressure, combo versatility, and ranged utility.",
    acquisition: "Defeat Bai Chilian and claim the weapon after the Crimson Forest encounter.",
    mechanics: ["Twin Serpent Dance", "Crimson Viper Orbit", "Ranged Execution"],
    placements: mainWeaponPlacements("S", "S", "A"),
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
      "KeenGamer and games.gg rate Fiend Saws S and Mobalytics A, with all three citing fast pressure and the burst window that follows a guard break.",
    acquisition:
      "Earned from Mu Xiaokui’s Village of Lu encounter after satisfying its weapon requirements.",
    mechanics: ["Fiend-Aura Erosion", "Fiend Form", "Unblockable burst window"],
    placements: mainWeaponPlacements("S", "S", "A"),
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
      "KeenGamer and games.gg place Freezing Chaos in S, while Mobalytics rates it A and stresses the execution cost of its three forms.",
    acquisition: "Defeat Yucong, No. 34 Twisted Puppet, through the Triple Threat questline.",
    mechanics: ["Threefold Shift", "Steel form", "Chaos form", "Frost form"],
    placements: mainWeaponPlacements("S", "S", "A"),
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
      "KeenGamer and games.gg put Soft Snake Sword in S; Mobalytics rates it A while still calling it a strong defensive option. Counter timing is the shared limitation.",
    acquisition: "Defeat Wu Lengshuang, the Soft Sword, in Mandate Encampment.",
    mechanics: ["Guard Stance", "Serpentine Reversal", "Wild Serpent Dance"],
    placements: mainWeaponPlacements("S", "S", "A"),
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
      "games.gg publishes no placement for it",
      "Damage and guard break trail other dual-wield options",
    ],
    whyThisTier:
      "KeenGamer places Seamless Death in A and Mobalytics in B, so two independent rankings now cover it. games.gg publishes no placement, and the two-source average lands in B.",
    acquisition: "Defeat Jade-Face near The Lady’s Shrine in Mountain of Imprisonment.",
    mechanics: ["Flying Rings", "Reaping Rings", "Phantom Step"],
    placements: [
      { sourceId: "keen-main", method: "tier", tier: "A" },
      { sourceId: "mobalytics-main", method: "tier", tier: "B" },
    ],
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
      "All three independent rankings place Parting Hooks in S and single out Guard Stance as a reliable counter-focused advantage.",
    acquisition: "Defeat Shadow Warden Soulclaimer in Pangzhen.",
    mechanics: ["Guard Stance", "Automatic counter", "Peerless Hook"],
    placements: mainWeaponPlacements("S", "S", "S"),
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
      "KeenGamer and games.gg place Scarlet Wraithblade in A, while Mobalytics rates it B for slower late-game commitments. All three value its area control and Sha-Chi pressure.",
    acquisition: "Defeat Hua, Deadly Betrothed, at Flesh Lily Fields in Weeping Creek Valley.",
    mechanics: ["Red Spider Lilies", "Rouge Bloomstorm", "Delayed area explosions"],
    placements: mainWeaponPlacements("A", "A", "B"),
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
      "KeenGamer and games.gg rate Baishan Stormswords A, and Mobalytics places it in S for its elemental payoff. The three placements still resolve to an A consensus.",
    acquisition: "Defeat Yubi, the No. 21 Swordfighter Puppet, in Mandate Encampment.",
    mechanics: ["Wind Gauge", "Thunder Gauge", "Baishan’s Blessing"],
    placements: mainWeaponPlacements("A", "A", "S"),
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
      "All three independent tier lists place Sundering Dual Axes in A, emphasizing Baleful Aura and lingering damage as strong but setup-dependent tools.",
    acquisition: "Defeat Shadow Warden Heartpiercer at White Serpent House in Meigu Lake.",
    mechanics: ["Baleful Aura", "Lingering thrown axes", "Sha-Chi depletion"],
    placements: mainWeaponPlacements("A", "A", "A"),
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
      "KeenGamer and games.gg place Whiteshadow in A while Mobalytics rates it S for reliable freezing. The three placements still resolve to an A consensus.",
    acquisition:
      "Defeat the Blizzard Blademaster in the secret Meigu Lake mountain area after collecting four Acolyte Masks.",
    mechanics: ["Chill buildup", "Frozen Gauge", "Whiteshadow’s Frosthowl"],
    placements: mainWeaponPlacements("A", "A", "S"),
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
      "KeenGamer and games.gg place Juggernaut in A; Mobalytics rates it B because its stats fall off late. The three placements still resolve to an A consensus.",
    acquisition: "Defeat Bi Feng, the Giant Saber Commander, in Mountain of Imprisonment.",
    mechanics: ["Red Edge stacks", "Parry conversion", "Bandit-Slaying Rampage"],
    placements: mainWeaponPlacements("A", "A", "B"),
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
      "All three sources rate Outlaw Warblade A for sustained melee healing, balanced by HP-cost mechanics and enemy-type restrictions.",
    acquisition: "Defeat Jing Ye, the Outlaw, in Crimson Forest.",
    mechanics: ["Lifesteal", "Bloodthirst Frenzy", "HP-cost heavy attacks"],
    placements: mainWeaponPlacements("A", "A", "A"),
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
      "KeenGamer and games.gg rate Wooden Sanguine A as an early guard-breaking support weapon; Mobalytics rates it B and warns it is not beginner friendly.",
    acquisition: "Received during the tutorial.",
    mechanics: ["Guard Break", "Parry pressure", "Weapon-swap setup"],
    placements: mainWeaponPlacements("A", "A", "B"),
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
      "All three rankings place Armybreaker in A for dependable Sha-Chi pressure and gap-closing utility.",
    acquisition: "Defeat Shadow Warden Cavalrybane in the Pangzhen marketplace.",
    mechanics: ["Forward rush", "Formation Breaking Art", "Sha-Chi depletion"],
    placements: mainWeaponPlacements("A", "A", "A"),
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
      "All three independent rankings place Wild Oriole Sword in A for temporary blade-wave reach and aggressive combo pressure.",
    acquisition: "Earn it through Mu Xiaokui’s additional boss phase in Village of Lu.",
    mechanics: ["Oriole Song", "Blade waves", "10-second enhanced state"],
    placements: mainWeaponPlacements("A", "A", "A"),
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
      "All three independent tier lists place The Fanatic’s Broken Blade in B: its range is valuable, but setup and movement restrictions reduce consistency.",
    acquisition: "Defeat Hua Qianxiao, the Sword Fanatic, in Crimson Forest.",
    mechanics: ["Bottomless Drink", "Tipsy state", "Drunk state"],
    placements: mainWeaponPlacements("B", "B", "B"),
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
      "All three tier lists place Sanguine Twin in B: it is fast and accessible, but short reach and limited late-game specialization reduce its priority.",
    acquisition:
      "Found on a weapon rack below the First Meeting with Yu’er bell in Weeping Creek Valley.",
    mechanics: ["Dual-Blade Flurry", "Fast multi-hit strings", "Short-range starters"],
    placements: mainWeaponPlacements("B", "B", "B"),
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
      "All three rankings place Sanguine Reach in B as a dependable early crowd option that is eventually outclassed by more specialized weapons.",
    acquisition: "Found on the weapon rack beside Forge at the Weeping Creek Valley Outpost.",
    mechanics: ["Longblade Chain Strikes", "Wide sweeping attacks", "Temporary damage buffs"],
    placements: mainWeaponPlacements("B", "B", "B"),
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
      "All three independent tier lists place Sanguine in B: it is reliable for learning the game, but later weapons offer more impactful mechanics.",
    acquisition: "Soul’s default starting weapon.",
    mechanics: ["Sweeping Blade", "Straightforward combos", "Beginner-friendly pressure"],
    placements: mainWeaponPlacements("B", "B", "B"),
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
      "All three qualifying rankings place Tianxuan Bronze Sword in B because reduced blocking costs are useful, but losing normal parries is a major trade-off.",
    acquisition: "Obtain it from Master Bi Yuan in Village of Lu.",
    mechanics: ["Natural Order", "Reduced block cost", "No normal parry"],
    placements: mainWeaponPlacements("B", "B", "B"),
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
      "KeenGamer rates Thunder Spear A for general combat usefulness. AllThingsHow confirms its level-1 card stats as supporting data only, so one qualifying comprehensive ranking source leaves the Final Tier Pending.",
    acquisition: "Obtained in Pangzhen from Chang Hong according to the launch ranking guide.",
    mechanics: ["Lightning attacks", "Status Effects", "Elemental pressure"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "A" }],
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
      "KeenGamer rates Fire Meteor A for general combat usefulness. Its card Damage and Status Effect values remain supporting data only, so one qualifying comprehensive ranking source leaves the Final Tier Pending.",
    acquisition: "Defeat Blaze in Pangzhen according to the launch ranking guide.",
    mechanics: ["Phosphor Flame", "Status damage", "Attack weakening"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "A" }],
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
      "KeenGamer rates Dread Axe A. games.gg independently confirms its shield-breaking and exploration utility but does not publish a comprehensive Phantom Edge tier for it, so the Final Tier remains Pending.",
    acquisition: "Defeat Peng Meng, the Axemaster, in Weeping Creek Valley.",
    mechanics: ["Charged cleave", "Iron Chain Breaker", "High Shield-Breaking power"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "A" }],
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
      "KeenGamer rates Heartrend Pipa B for general combat usefulness. Card-stat ordering is supporting data rather than a second comprehensive ranking, so the Final Tier remains Pending.",
    acquisition: "Defeat Yuzan in Village of Lu according to the launch guide.",
    mechanics: ["Sonic Blades", "Mid-range projectiles", "Artifice utility"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "B" }],
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
      "KeenGamer rates Wolfjaw A for sustained combat value. Its Guard Break and Damage card values are supporting facts only, so the Final Tier remains Pending with one qualifying comprehensive ranking source.",
    acquisition: "Defeat Wu Xuan in Pangzhen according to launch guides.",
    mechanics: ["Guard Break", "Lifesteal", "Heavy melee pressure"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "A" }],
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
      "KeenGamer rates Iron Gauntlets S for aggressive shield-breaking utility. games.gg describes the same combat role but does not publish a comprehensive Phantom Edge tier, so the Final Tier remains Pending.",
    acquisition: "Defeat Stone Hand Iron Fever in Crimson Forest.",
    mechanics: ["Fist Focus", "Shield breaking", "Fast multi-hit attacks"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "S" }],
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
      "KeenGamer rates Flaming Mane S for combat and exploration utility. games.gg confirms its fire and traversal functions but does not provide a comprehensive Phantom Edge tier, so the Final Tier remains Pending.",
    acquisition: "Earned through the Flaming Mane boss and repair sequence in Pangzhen.",
    mechanics: ["Fire breath", "Crowd control", "Burning Path traversal"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "S" }],
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
      "KeenGamer rates Hunter’s Chain Sickle S and calls it the best all-around Phantom Edge. games.gg confirms its mobility and traversal role without publishing a comprehensive tier, so the Final Tier remains Pending.",
    acquisition: "Defeat The Hunt in Weeping Creek Valley.",
    mechanics: ["Chain-sickle attacks", "Gap closing", "Grappling Traverse"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "S" }],
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
      "KeenGamer rates Bastion A for defensive utility. Card Damage is supporting data rather than a second comprehensive ranking, so the Final Tier remains Pending.",
    acquisition:
      "Village of Lu boss reward; secondary sources differ on the boss-name spelling, so that detail remains under review.",
    mechanics: ["Blocking", "Damage absorption", "Counterattack"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "A" }],
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
      "KeenGamer rates Kuye Temple Prayer Beads S for summon pressure. games.gg documents its summon mechanics but not a comprehensive Phantom Edge tier, so the Final Tier remains Pending.",
    acquisition: "Defeat Master Bi Hai of Kuye Temple in Village of Lu.",
    mechanics: ["Three Bronze Men summons", "Tempered Gold Men", "Persistent ally pressure"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "S" }],
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
      "KeenGamer rates Inanis’ Radiant Fan S for survivability and recovery. games.gg independently documents its healing utility but does not publish a comprehensive tier, so the Final Tier remains Pending.",
    acquisition:
      "Complete Whence the Weeping in Mountain of Imprisonment and claim the reward associated with Inanis.",
    mechanics: ["Sanctuary field", "Nirvana revival", "Recovery support"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "S" }],
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
      "KeenGamer rates Puppeteer’s Bell A for summon support. games.gg documents the summon and unlock path without a comprehensive tier ranking, so the Final Tier remains Pending.",
    acquisition:
      "Defeat Dusk in Village of Lu after collecting the required six Firefly Memory Flowers.",
    mechanics: ["Puppet summons", "Abyssal Bell", "Third-Puppet tempered upgrade"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "A" }],
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
      "KeenGamer rates Feather Bow A for ranged utility. games.gg documents its ranged opening and exploration utility but does not publish a comprehensive tier, so the Final Tier remains Pending.",
    acquisition: "Complete Purge the Sect in Weeping Creek Valley.",
    mechanics: ["Ranged Shot", "Precision Shot", "Charge-timing bonus"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "A" }],
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
      "KeenGamer rates Bashpole S for guard breaking and crowd pressure. games.gg confirms its shield-breaking and traversal utility but does not publish a comprehensive Phantom Edge tier, so the Final Tier remains Pending.",
    acquisition: "Defeat Wan Jun, the Coppermaul, in Mandate Encampment.",
    mechanics: ["Ground-shaking heavy attacks", "Groundbreaker", "High Shield-Breaking power"],
    placements: [{ sourceId: "keen-edge", method: "tier", tier: "S" }],
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
  // One qualifying-placement set drives the gate, the vote, and the disagreement
  // check. Official and supporting placements are never tier votes, so they must
  // not reach normalizePlacement, the mean, or the consensus tier.
  const rankingPlacements = entity.placements.filter((placement) => {
    const source = phantomBladeZeroSources.find((candidate) => candidate.id === placement.sourceId);
    return source?.nature === "ranking";
  });

  const rankingSources = rankingPlacements
    .map((placement) => phantomBladeZeroSources.find((source) => source.id === placement.sourceId))
    .filter((source): source is RankingSource => Boolean(source));

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

  const normalized = rankingPlacements.map(normalizePlacement);
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
  snapshotDate: "2026-11-08",
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
        "KeenGamer and games.gg place it in S and Mobalytics in A, so the consensus stays S for repeatable Bleed pressure.",
    },
    {
      label: "Defensive Pick",
      entityId: "soft-snake-sword",
      reason:
        "KeenGamer and games.gg place it in S and Mobalytics in A, with all three valuing its counter-focused defense.",
    },
  ] as const,
  whatChanged:
    "Mobalytics was added as an independent Main Weapon ranking source on 8 November 2026, so the evidence package was reviewed again. Every reviewed Main Weapon now carries three independent placements instead of two, Seamless Death left Pending for B, and no Phantom Edge changed.",
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
