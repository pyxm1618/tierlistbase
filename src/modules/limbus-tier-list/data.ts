export const sinners = [
  "Yi Sang",
  "Faust",
  "Don Quixote",
  "Ryōshū",
  "Meursault",
  "Hong Lu",
  "Heathcliff",
  "Ishmael",
  "Rodion",
  "Sinclair",
  "Outis",
  "Gregor",
] as const;

export type SinnerName = (typeof sinners)[number];
export type TierValue = "SSS" | "SS" | "S" | "A" | "B" | "C";
export type RatingValue = "A" | "B" | "C" | "High" | "Medium" | "Low";
export type Availability = "Available" | "Seasonal" | "Shardable";
export type TeamType = "Status" | "Faction" | "Mechanic" | "Hybrid";

export type IdentityRow = {
  rank: number;
  tier: TierValue;
  identity: string;
  sinner: SinnerName;
  rarity: "000" | "00" | "0";
  role: string;
  mainTeam: string;
  damageType: string;
  sin: string;
  generalistValue: "S" | "A" | "B";
  beginnerFriendly: "A" | "B" | "C";
  teamDependency: "High" | "Medium" | "Low";
  availability: Availability;
};

export type SinnerIdentityPick = {
  sinner: SinnerName;
  bestOverall: string;
  bestGeneralist: string;
  bestForTeam: string;
};

export type TeamRow = {
  rank: number;
  tier: TierValue;
  team: string;
  type: TeamType;
  keyMechanic: string;
  power: TierValue;
  storyGeneral: TierValue;
  mirrorDungeon: TierValue;
  railway: TierValue;
  buildCost: "High" | "Medium" | "Low";
  beginnerFriendly: "High" | "Medium" | "Low";
};

export type TeamDetail = {
  team: string;
  powerTier: TierValue;
  storyGeneral: TierValue;
  mirrorDungeon: TierValue;
  railwayEndgame: TierValue;
  buildCost: "High" | "Medium" | "Low";
  coreDependency: "High" | "Medium" | "Low";
  flexibility: "High" | "Medium" | "Low";
  easeOfUse: "High" | "Medium" | "Low";
  beginnerFriendly: "High" | "Medium" | "Low";
  coreMembers: string[];
  recommendedTeam: string[];
  substitutes: string[];
  keyEgo: string[];
  missingOne: string;
};

export type EgoRow = {
  rank: number;
  tier: TierValue;
  ego: string;
  sinner: SinnerName;
  mainTeam: string;
  bestUseCase: string;
  generalist: "S" | "A" | "B";
  teamImportance: "Core" | "High" | "Medium";
  availability: Availability;
};

export type SinnerEgoPick = {
  sinner: SinnerName;
  bestOverall: string;
  bestGeneralist: string;
  bestForTeam: string;
};

export const identityRows: IdentityRow[] = [
  {
    rank: 1,
    tier: "SSS",
    identity: "The Priestess of La Manchaland",
    sinner: "Don Quixote",
    rarity: "000",
    role: "DPS",
    mainTeam: "Bleed",
    damageType: "Slash",
    sin: "Wrath",
    generalistValue: "S",
    beginnerFriendly: "B",
    teamDependency: "High",
    availability: "Available",
  },
  {
    rank: 2,
    tier: "SSS",
    identity: "W Corp. L3 Cleanup",
    sinner: "Yi Sang",
    rarity: "000",
    role: "DPS",
    mainTeam: "Sinking",
    damageType: "Pierce",
    sin: "Gloom",
    generalistValue: "A",
    beginnerFriendly: "C",
    teamDependency: "High",
    availability: "Seasonal",
  },
  {
    rank: 3,
    tier: "SS",
    identity: "T Corp. Class 3",
    sinner: "Hong Lu",
    rarity: "000",
    role: "DPS",
    mainTeam: "Tremor",
    damageType: "Blunt",
    sin: "Sloth",
    generalistValue: "A",
    beginnerFriendly: "B",
    teamDependency: "Medium",
    availability: "Shardable",
  },
  {
    rank: 4,
    tier: "SS",
    identity: "Dieci Assoc. South Section 4",
    sinner: "Ryōshū",
    rarity: "000",
    role: "Support",
    mainTeam: "Poise",
    damageType: "Slash",
    sin: "Pride",
    generalistValue: "B",
    beginnerFriendly: "A",
    teamDependency: "Low",
    availability: "Available",
  },
  {
    rank: 5,
    tier: "SS",
    identity: "N Corp. Großhammer",
    sinner: "Heathcliff",
    rarity: "000",
    role: "DPS",
    mainTeam: "Charge",
    damageType: "Blunt",
    sin: "Envy",
    generalistValue: "A",
    beginnerFriendly: "B",
    teamDependency: "Medium",
    availability: "Available",
  },
];

export const bestIdentityBySinner: SinnerIdentityPick[] = [
  {
    sinner: "Yi Sang",
    bestOverall: "W Corp. L3 Cleanup",
    bestGeneralist: "Seven Assoc.",
    bestForTeam: "Liu Assoc. (Rupture)",
  },
  {
    sinner: "Faust",
    bestOverall: "W Corp. Identity",
    bestGeneralist: "Seven Assoc.",
    bestForTeam: "Liu Assoc. (Rupture)",
  },
  {
    sinner: "Don Quixote",
    bestOverall: "The Priestess of La Manchaland",
    bestGeneralist: "Cinq Assoc.",
    bestForTeam: "N Corp. (Bleed)",
  },
  {
    sinner: "Ryōshū",
    bestOverall: "Dieci Assoc. South Section 4",
    bestGeneralist: "Cinq Assoc.",
    bestForTeam: "N Corp. (Poise)",
  },
  {
    sinner: "Meursault",
    bestOverall: "T Corp. Class 3",
    bestGeneralist: "Liu Assoc.",
    bestForTeam: "W Corp. (Charge)",
  },
  {
    sinner: "Hong Lu",
    bestOverall: "T Corp. Class 3",
    bestGeneralist: "Liu Assoc.",
    bestForTeam: "Seven Assoc. (Tremor)",
  },
  {
    sinner: "Heathcliff",
    bestOverall: "N Corp. Großhammer",
    bestGeneralist: "Liu Assoc.",
    bestForTeam: "W Corp. (Charge)",
  },
  {
    sinner: "Ishmael",
    bestOverall: "Cinq Assoc. South Section 5",
    bestGeneralist: "Liu Assoc.",
    bestForTeam: "R Corp. (Poise)",
  },
  {
    sinner: "Rodion",
    bestOverall: "Liu Assoc. South Section 5",
    bestGeneralist: "Zwei Assoc.",
    bestForTeam: "Zwei Assoc. (Bleed)",
  },
  {
    sinner: "Sinclair",
    bestOverall: "Zwei Assoc. South Section 6",
    bestGeneralist: "Cinq Assoc.",
    bestForTeam: "T Corp. (Tremor)",
  },
  {
    sinner: "Outis",
    bestOverall: "Seven Assoc. South Section 6",
    bestGeneralist: "Liu Assoc.",
    bestForTeam: "R Corp. (Burn)",
  },
  {
    sinner: "Gregor",
    bestOverall: "Liu Assoc. South Section 6",
    bestGeneralist: "Cinq Assoc.",
    bestForTeam: "G Corp. (Rupture)",
  },
];

export const teamRows: TeamRow[] = [
  {
    rank: 1,
    tier: "SSS",
    team: "Bleed",
    type: "Status",
    keyMechanic: "Bleed",
    power: "SSS",
    storyGeneral: "S",
    mirrorDungeon: "SS",
    railway: "SSS",
    buildCost: "High",
    beginnerFriendly: "Low",
  },
  {
    rank: 2,
    tier: "SSS",
    team: "Sinking",
    type: "Status",
    keyMechanic: "Sinking",
    power: "SSS",
    storyGeneral: "S",
    mirrorDungeon: "SS",
    railway: "SS",
    buildCost: "High",
    beginnerFriendly: "Medium",
  },
  {
    rank: 3,
    tier: "SS",
    team: "Tremor",
    type: "Status",
    keyMechanic: "Tremor",
    power: "SS",
    storyGeneral: "A",
    mirrorDungeon: "SS",
    railway: "S",
    buildCost: "Medium",
    beginnerFriendly: "Medium",
  },
  {
    rank: 4,
    tier: "SS",
    team: "Poise",
    type: "Status",
    keyMechanic: "Poise",
    power: "SS",
    storyGeneral: "S",
    mirrorDungeon: "S",
    railway: "S",
    buildCost: "Medium",
    beginnerFriendly: "High",
  },
  {
    rank: 5,
    tier: "SS",
    team: "Charge",
    type: "Status",
    keyMechanic: "Charge",
    power: "SS",
    storyGeneral: "A",
    mirrorDungeon: "S",
    railway: "S",
    buildCost: "Medium",
    beginnerFriendly: "High",
  },
  {
    rank: 6,
    tier: "SS",
    team: "Burn",
    type: "Status",
    keyMechanic: "Burn",
    power: "S",
    storyGeneral: "A",
    mirrorDungeon: "S",
    railway: "S",
    buildCost: "Medium",
    beginnerFriendly: "Medium",
  },
  {
    rank: 7,
    tier: "S",
    team: "Rupture",
    type: "Status",
    keyMechanic: "Rupture",
    power: "S",
    storyGeneral: "A",
    mirrorDungeon: "S",
    railway: "A",
    buildCost: "Medium",
    beginnerFriendly: "Medium",
  },
  {
    rank: 8,
    tier: "S",
    team: "N Corp.",
    type: "Faction",
    keyMechanic: "N Corp.",
    power: "S",
    storyGeneral: "A",
    mirrorDungeon: "SS",
    railway: "SS",
    buildCost: "High",
    beginnerFriendly: "Low",
  },
  {
    rank: 9,
    tier: "S",
    team: "W Corp.",
    type: "Faction",
    keyMechanic: "W Corp.",
    power: "S",
    storyGeneral: "A",
    mirrorDungeon: "SS",
    railway: "S",
    buildCost: "High",
    beginnerFriendly: "Low",
  },
  {
    rank: 10,
    tier: "S",
    team: "Hybrid",
    type: "Hybrid",
    keyMechanic: "Multi-Tool",
    power: "S",
    storyGeneral: "S",
    mirrorDungeon: "S",
    railway: "S",
    buildCost: "High",
    beginnerFriendly: "Medium",
  },
];

export const exampleTeamDetail: TeamDetail = {
  team: "Bleed Team",
  powerTier: "SSS",
  storyGeneral: "S",
  mirrorDungeon: "SS",
  railwayEndgame: "SSS",
  buildCost: "High",
  coreDependency: "High",
  flexibility: "Medium",
  easeOfUse: "Medium",
  beginnerFriendly: "Low",
  coreMembers: ["Core A", "Core B", "Core C"],
  recommendedTeam: ["Member A", "Member B", "Member C"],
  substitutes: ["Alt A", "Alt B", "Alt C", "Alt D", "Alt E"],
  keyEgo: ["Key E.G.O A", "Key E.G.O B", "Key E.G.O C"],
  missingOne: "N Corp. Großhammer (Heathcliff)",
};

export const egoRows: EgoRow[] = [
  {
    rank: 1,
    tier: "SSS",
    ego: "Fluid Sac",
    sinner: "Faust",
    mainTeam: "Sinking",
    bestUseCase: "Sustain / Support",
    generalist: "S",
    teamImportance: "Core",
    availability: "Available",
  },
  {
    rank: 2,
    tier: "SSS",
    ego: "Solemn Lament",
    sinner: "Yi Sang",
    mainTeam: "Sinking",
    bestUseCase: "Nuke / AoE",
    generalist: "A",
    teamImportance: "Core",
    availability: "Seasonal",
  },
  {
    rank: 3,
    tier: "SS",
    ego: "Sunshower",
    sinner: "Ishmael",
    mainTeam: "Sinking",
    bestUseCase: "AoE / Count",
    generalist: "A",
    teamImportance: "High",
    availability: "Available",
  },
  {
    rank: 4,
    tier: "SS",
    ego: "Ardor Blossom Star",
    sinner: "Ryōshū",
    mainTeam: "Bleed",
    bestUseCase: "Nuke / Debuff",
    generalist: "B",
    teamImportance: "Core",
    availability: "Available",
  },
  {
    rank: 5,
    tier: "SS",
    ego: "Branch of Knowledge",
    sinner: "Don Quixote",
    mainTeam: "Poise",
    bestUseCase: "Support / Utility",
    generalist: "A",
    teamImportance: "High",
    availability: "Shardable",
  },
];

export const bestEgoBySinner: SinnerEgoPick[] = sinners.map((sinner, index) => {
  const overall = ["Fluid Sac", "Solemn Lament", "Sunshower", "Ardor Blossom Star"];
  const generalist = ["Lantern", "Crow's Eye View", "Representation Emitter", "Pursuance"];
  const team = ["Rime Shank", "Dimension Shredder", "Telepole", "Ya Śūnyatā Tad Rūpam"];

  return {
    sinner,
    bestOverall: overall[index % overall.length]!,
    bestGeneralist: generalist[index % generalist.length]!,
    bestForTeam: team[index % team.length]!,
  };
});
