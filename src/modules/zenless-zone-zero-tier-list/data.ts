export const agentRankingViews = [
  "Overall",
  "Shiyu Defense",
  "Deadly Assault",
  "New Player Value",
  "Low Investment",
] as const;

export const teamRankingViews = [
  "Overall",
  "Shiyu Defense",
  "Deadly Assault",
  "Investment",
  "Budget / F2P",
] as const;

export type AgentRankingView = (typeof agentRankingViews)[number];
export type TeamRankingView = (typeof teamRankingViews)[number];
export type Tier = "S+" | "S" | "A" | "B";

export type Agent = {
  id: string;
  name: string;
  tier: Tier;
  viewTiers: Record<AgentRankingView, Tier>;
  combatRole: string;
  specialty: string;
  attribute: string;
  faction: string;
  rarity: "S-Rank" | "A-Rank";
  overallRating: string;
  newPlayerValue: string;
  investmentLevel: string;
  teamFlexibility: string;
  signatureDependency: string;
  shiyuDefense: string;
  deadlyAssault: string;
  currentCycleSuitability: string;
  keyStrengths: string[];
  keyLimitations: string[];
  bestWEngine: string;
  bestAlternative: string;
  bestF2pOption: string;
  bestDriveDisc: string;
  mainStats: string[];
  importantSubstats: string[];
  bestTeams: string[];
};

type AgentSeed = {
  name: string;
  tier: Tier;
  combatRole: string;
  specialty: string;
  attribute: string;
  faction: string;
  rarity?: "S-Rank" | "A-Rank";
  shiyu?: Tier;
  assault?: Tier;
  newPlayer?: Tier;
  lowInvestment?: Tier;
};

const agentSeeds: readonly AgentSeed[] = [
  {
    name: "Miyabi",
    tier: "S+",
    combatRole: "Main DPS",
    specialty: "Anomaly",
    attribute: "Frost",
    faction: "H.S.O.S. 6",
    shiyu: "S+",
    assault: "S",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Evelyn",
    tier: "S+",
    combatRole: "Main DPS",
    specialty: "Attack",
    attribute: "Fire",
    faction: "Stars of Lyra",
    shiyu: "S+",
    assault: "S+",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Astra",
    tier: "S+",
    combatRole: "Support",
    specialty: "Support",
    attribute: "Ether",
    faction: "Stars of Lyra",
    shiyu: "S+",
    assault: "S+",
    newPlayer: "S",
    lowInvestment: "S",
  },
  {
    name: "Jane",
    tier: "S+",
    combatRole: "Main DPS",
    specialty: "Anomaly",
    attribute: "Physical",
    faction: "N.E.P.S.",
    shiyu: "S",
    assault: "S+",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Zhu Yuan",
    tier: "S+",
    combatRole: "Main DPS",
    specialty: "Attack",
    attribute: "Ether",
    faction: "N.E.P.S.",
    shiyu: "S+",
    assault: "S",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Harumasa",
    tier: "S",
    combatRole: "Main DPS",
    specialty: "Attack",
    attribute: "Electric",
    faction: "H.S.O.S. 6",
    shiyu: "S",
    assault: "S",
    newPlayer: "S",
    lowInvestment: "S",
  },
  {
    name: "Yanagi",
    tier: "S",
    combatRole: "Main DPS",
    specialty: "Anomaly",
    attribute: "Electric",
    faction: "H.S.O.S. 6",
    shiyu: "S",
    assault: "S+",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Caesar",
    tier: "S",
    combatRole: "Support",
    specialty: "Defense",
    attribute: "Physical",
    faction: "Sons of Calydon",
    shiyu: "S",
    assault: "S",
    newPlayer: "S+",
    lowInvestment: "S",
  },
  {
    name: "Burnice",
    tier: "S",
    combatRole: "Sub DPS",
    specialty: "Anomaly",
    attribute: "Fire",
    faction: "Sons of Calydon",
    shiyu: "S",
    assault: "S+",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Qingyi",
    tier: "S",
    combatRole: "Stun",
    specialty: "Stun",
    attribute: "Electric",
    faction: "N.E.P.S.",
    shiyu: "S+",
    assault: "S",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Lighter",
    tier: "S",
    combatRole: "Stun",
    specialty: "Stun",
    attribute: "Fire",
    faction: "Sons of Calydon",
    shiyu: "S",
    assault: "S",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Soukaku",
    tier: "A",
    combatRole: "Support",
    specialty: "Support",
    attribute: "Ice",
    faction: "H.S.O.S. 6",
    rarity: "A-Rank",
    shiyu: "A",
    assault: "A",
    newPlayer: "S",
    lowInvestment: "S+",
  },
  {
    name: "Nicole",
    tier: "A",
    combatRole: "Support",
    specialty: "Support",
    attribute: "Ether",
    faction: "Cunning Hares",
    rarity: "A-Rank",
    shiyu: "A",
    assault: "A",
    newPlayer: "S",
    lowInvestment: "S+",
  },
  {
    name: "Rina",
    tier: "A",
    combatRole: "Support",
    specialty: "Support",
    attribute: "Electric",
    faction: "Victoria Housekeeping",
    shiyu: "A",
    assault: "A",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Anby",
    tier: "A",
    combatRole: "Stun",
    specialty: "Stun",
    attribute: "Electric",
    faction: "Cunning Hares",
    rarity: "A-Rank",
    shiyu: "A",
    assault: "A",
    newPlayer: "S",
    lowInvestment: "S+",
  },
  {
    name: "Nekomata",
    tier: "A",
    combatRole: "Main DPS",
    specialty: "Attack",
    attribute: "Physical",
    faction: "Cunning Hares",
    shiyu: "A",
    assault: "A",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Piper",
    tier: "A",
    combatRole: "Sub DPS",
    specialty: "Anomaly",
    attribute: "Physical",
    faction: "Sons of Calydon",
    rarity: "A-Rank",
    shiyu: "A",
    assault: "S",
    newPlayer: "S",
    lowInvestment: "S+",
  },
  {
    name: "Ben",
    tier: "B",
    combatRole: "Support",
    specialty: "Defense",
    attribute: "Fire",
    faction: "Belobog",
    rarity: "A-Rank",
    shiyu: "B",
    assault: "B",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Anton",
    tier: "B",
    combatRole: "Main DPS",
    specialty: "Attack",
    attribute: "Electric",
    faction: "Belobog",
    rarity: "A-Rank",
    shiyu: "B",
    assault: "B",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Billy",
    tier: "B",
    combatRole: "Main DPS",
    specialty: "Attack",
    attribute: "Physical",
    faction: "Cunning Hares",
    rarity: "A-Rank",
    shiyu: "B",
    assault: "B",
    newPlayer: "A",
    lowInvestment: "S",
  },
  {
    name: "Lucy",
    tier: "B",
    combatRole: "Support",
    specialty: "Support",
    attribute: "Fire",
    faction: "Sons of Calydon",
    rarity: "A-Rank",
    shiyu: "A",
    assault: "B",
    newPlayer: "A",
    lowInvestment: "S",
  },
  {
    name: "Corin",
    tier: "B",
    combatRole: "Main DPS",
    specialty: "Attack",
    attribute: "Physical",
    faction: "Victoria Housekeeping",
    rarity: "A-Rank",
    shiyu: "B",
    assault: "B",
    newPlayer: "A",
    lowInvestment: "A",
  },
  {
    name: "Seth",
    tier: "B",
    combatRole: "Support",
    specialty: "Defense",
    attribute: "Electric",
    faction: "N.E.P.S.",
    rarity: "A-Rank",
    shiyu: "B",
    assault: "A",
    newPlayer: "A",
    lowInvestment: "A",
  },
];

function slugify(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function makeAgent(seed: AgentSeed): Agent {
  const rarity = seed.rarity ?? "S-Rank";
  const overallRating = seed.tier;
  const supportLike = seed.combatRole === "Support" || seed.combatRole === "Stun";
  return {
    id: slugify(seed.name),
    name: seed.name,
    tier: seed.tier,
    viewTiers: {
      Overall: seed.tier,
      "Shiyu Defense": seed.shiyu ?? seed.tier,
      "Deadly Assault": seed.assault ?? seed.tier,
      "New Player Value": seed.newPlayer ?? seed.tier,
      "Low Investment": seed.lowInvestment ?? seed.tier,
    },
    combatRole: seed.combatRole,
    specialty: seed.specialty,
    attribute: seed.attribute,
    faction: seed.faction,
    rarity,
    overallRating,
    newPlayerValue: seed.newPlayer === "S+" || seed.newPlayer === "S" ? "High" : "Medium",
    investmentLevel: supportLike ? "Medium" : seed.tier === "S+" ? "High" : "Medium",
    teamFlexibility: supportLike ? "High" : seed.tier === "S+" ? "High" : "Medium",
    signatureDependency: seed.tier === "S+" && !supportLike ? "High" : "Medium",
    shiyuDefense: seed.shiyu ?? seed.tier,
    deadlyAssault: seed.assault ?? seed.tier,
    currentCycleSuitability:
      seed.tier === "S+" ? "Excellent" : seed.tier === "S" ? "Strong" : "Good",
    keyStrengths: [
      supportLike ? "Fits multiple practical team cores" : "Strong personal damage ceiling",
      "Reliable performance across the intended ranking contexts",
      seed.tier === "S+" ? "High long-term account value" : "Useful roster coverage",
      "Clear upgrade path without changing the page decision model",
    ],
    keyLimitations: [
      seed.tier === "S+" ? "Higher resource demand at peak investment" : "Lower ceiling than top picks",
      supportLike ? "Value depends on the team core around them" : "Needs appropriate support coverage",
      "Matchup and rotation quality can change practical results",
    ],
    bestWEngine: seed.tier === "S+" ? "Signature W-Engine" : "Premium Role W-Engine",
    bestAlternative: "A-Rank Role Alternative",
    bestF2pOption: "Craftable / Event Option",
    bestDriveDisc: seed.specialty === "Anomaly" ? "Anomaly-focused 4-Pc Set" : "Role-focused 4-Pc Set",
    mainStats:
      seed.specialty === "Anomaly"
        ? ["Anomaly Proficiency", "Attribute DMG", "Anomaly Mastery"]
        : ["CRIT / Utility", "Attribute DMG", "ATK / Impact"],
    importantSubstats:
      seed.specialty === "Anomaly"
        ? ["Anomaly Proficiency", "ATK%", "PEN / utility"]
        : ["CRIT Rate / CRIT DMG", "ATK%", "PEN / utility"],
    bestTeams:
      seed.name === "Miyabi"
        ? ["Miyabi Freeze", "Miyabi Anomaly", "Flexible Frost Core"]
        : [`${seed.name} Premium Core`, `${seed.name} Flexible Core`, `${seed.name} Budget Core`],
  };
}

export const agents: readonly Agent[] = agentSeeds.map(makeAgent);

export type TeamComposition = {
  label: string;
  subtitle: string;
  members: readonly { name: string; role: string }[];
};

export type Team = {
  id: string;
  name: string;
  tier: Tier;
  viewTiers: Record<TeamRankingView, Tier>;
  tags: readonly string[];
  bestFor: readonly string[];
  teamArchetype: string;
  mainDamageConcept: string;
  investmentLevel: string;
  teamCost: string;
  compositions: readonly TeamComposition[];
  bestBangboo: string;
  alternativeBangboo: string;
  activationRequirement: readonly string[];
  shiyuDefense: string;
  deadlyAssault: string;
  currentCycleSuitability: string;
};

export const teams: readonly Team[] = [
  {
    id: "miyabi-freeze",
    name: "Miyabi Freeze",
    tier: "S+",
    viewTiers: {
      Overall: "S+",
      "Shiyu Defense": "S+",
      "Deadly Assault": "S",
      Investment: "A",
      "Budget / F2P": "A",
    },
    tags: ["Burst DPS", "Control", "Easy to Play"],
    bestFor: ["Shiyu Defense", "Crowd Control", "Long-term account value"],
    teamArchetype: "Freeze / Control",
    mainDamageConcept: "Frost DMG",
    investmentLevel: "High",
    teamCost: "High",
    compositions: [
      {
        label: "Best Version",
        subtitle: "Highest performance",
        members: [
          { name: "Miyabi", role: "Main DPS" },
          { name: "Soukaku", role: "Support" },
          { name: "Rina", role: "Support" },
        ],
      },
      {
        label: "Alternative Version",
        subtitle: "Replacement options",
        members: [
          { name: "Miyabi", role: "Main DPS" },
          { name: "Astra", role: "Support" },
          { name: "Rina", role: "Support" },
        ],
      },
      {
        label: "Budget / F2P Version",
        subtitle: "Low cost & accessible",
        members: [
          { name: "Miyabi", role: "Main DPS" },
          { name: "Anby", role: "Stun" },
          { name: "Nicole", role: "Support" },
        ],
      },
    ],
    bestBangboo: "Sharkboo",
    alternativeBangboo: "Butlerboo / Rocketboo",
    activationRequirement: [
      "Triggers on Frost or Anomaly conditions",
      "Works with stun windows",
      "Best in three-Agent freeze teams",
    ],
    shiyuDefense: "S+ · Excellent",
    deadlyAssault: "S · Good",
    currentCycleSuitability: "Excellent",
  },
  {
    id: "evelyn-hypercarry",
    name: "Evelyn Hypercarry",
    tier: "S",
    viewTiers: {
      Overall: "S",
      "Shiyu Defense": "S",
      "Deadly Assault": "S+",
      Investment: "B",
      "Budget / F2P": "A",
    },
    tags: ["High Burst", "Fire DPS", "Advanced"],
    bestFor: ["High damage potential", "Single-target content", "Players who like aggressive play"],
    teamArchetype: "Hypercarry",
    mainDamageConcept: "Fire burst windows",
    investmentLevel: "High",
    teamCost: "High",
    compositions: [
      {
        label: "Best Version",
        subtitle: "Highest performance",
        members: [
          { name: "Evelyn", role: "Main DPS" },
          { name: "Lighter", role: "Stun" },
          { name: "Astra", role: "Support" },
        ],
      },
      {
        label: "Alternative Version",
        subtitle: "Replacement options",
        members: [
          { name: "Evelyn", role: "Main DPS" },
          { name: "Qingyi", role: "Stun" },
          { name: "Lucy", role: "Support" },
        ],
      },
      {
        label: "Budget / F2P Version",
        subtitle: "Low cost & accessible",
        members: [
          { name: "Evelyn", role: "Main DPS" },
          { name: "Anby", role: "Stun" },
          { name: "Lucy", role: "Support" },
        ],
      },
    ],
    bestBangboo: "Rocketboo",
    alternativeBangboo: "Cryboo",
    activationRequirement: ["Fire-oriented core", "Reliable stun window", "Consistent burst rotation"],
    shiyuDefense: "S · Strong",
    deadlyAssault: "S+ · Excellent",
    currentCycleSuitability: "Strong",
  },
  {
    id: "harumasa-quicken",
    name: "Harumasa Quicken",
    tier: "S",
    viewTiers: {
      Overall: "S",
      "Shiyu Defense": "A",
      "Deadly Assault": "S",
      Investment: "S",
      "Budget / F2P": "S+",
    },
    tags: ["Flexible", "Good AoE", "F2P Friendly"],
    bestFor: ["New players", "Low investment", "Smooth progression"],
    teamArchetype: "Flexible Electric",
    mainDamageConcept: "Electric burst and quick-swap",
    investmentLevel: "Medium",
    teamCost: "Low",
    compositions: [
      {
        label: "Best Version",
        subtitle: "Highest performance",
        members: [
          { name: "Harumasa", role: "Main DPS" },
          { name: "Qingyi", role: "Stun" },
          { name: "Astra", role: "Support" },
        ],
      },
      {
        label: "Alternative Version",
        subtitle: "Replacement options",
        members: [
          { name: "Harumasa", role: "Main DPS" },
          { name: "Anby", role: "Stun" },
          { name: "Rina", role: "Support" },
        ],
      },
      {
        label: "Budget / F2P Version",
        subtitle: "Low cost & accessible",
        members: [
          { name: "Harumasa", role: "Main DPS" },
          { name: "Anby", role: "Stun" },
          { name: "Nicole", role: "Support" },
        ],
      },
    ],
    bestBangboo: "Plugboo",
    alternativeBangboo: "Electroboo",
    activationRequirement: ["Electric coverage", "Stun or support utility", "Comfortable quick-swap cadence"],
    shiyuDefense: "A · Good",
    deadlyAssault: "S · Strong",
    currentCycleSuitability: "Good",
  },
];

export type PullAdvice = {
  id: string;
  name: string;
  bannerStatus: "Current Banner" | "Upcoming";
  dateLabel: string;
  role: string;
  style: string;
  pullValue: string;
  f2pFriendliness: string;
  pullIf: readonly string[];
  lowerPriorityIf: readonly string[];
  bestForAccounts: readonly string[];
  improvesTeams: readonly string[];
  enablesNewTeamCore: string;
  teamCost: string;
  investment: string;
  signatureImportance: string;
  alternatives: readonly string[];
};

export const pullAdvices: readonly PullAdvice[] = [
  {
    id: "miyabi-pull",
    name: "Miyabi",
    bannerStatus: "Current Banner",
    dateLabel: "Until Jan 22, 2025",
    role: "Main DPS",
    style: "Anomaly DPS",
    pullValue: "High",
    f2pFriendliness: "Medium",
    pullIf: [
      "You need a strong main DPS",
      "You want to improve Shiyu Defense",
      "You like Frost / Anomaly teams",
      "You plan to build a premium long-term core",
    ],
    lowerPriorityIf: [
      "You already have a well-built main DPS",
      "You are a new player with very limited resources",
      "You prefer low-investment teams",
      "You do not like the intended playstyle",
    ],
    bestForAccounts: [
      "Accounts lacking a main DPS",
      "Accounts focused on endgame",
      "Players who like Anomaly teams",
      "Mid-to-high investment accounts",
    ],
    improvesTeams: ["Miyabi Freeze", "Miyabi Anomaly", "Flexible Frost Core"],
    enablesNewTeamCore: "Yes — enables Frost / Anomaly-centered cores",
    teamCost: "High",
    investment: "High",
    signatureImportance: "High but not mandatory",
    alternatives: ["Harumasa for lower account cost", "Jane for alternate Anomaly core"],
  },
  {
    id: "harumasa-pull",
    name: "Harumasa",
    bannerStatus: "Current Banner",
    dateLabel: "Until Jan 22, 2025",
    role: "Main DPS",
    style: "Flexible DPS",
    pullValue: "High",
    f2pFriendliness: "High",
    pullIf: [
      "You want a flexible damage dealer",
      "You need an accessible team core",
      "You value lower team cost",
    ],
    lowerPriorityIf: [
      "You already have broad Electric coverage",
      "You only want the highest ceiling option",
    ],
    bestForAccounts: ["Newer accounts", "Low-investment accounts", "Flexible roster builders"],
    improvesTeams: ["Harumasa Quicken", "Electric Quick-Swap"],
    enablesNewTeamCore: "Yes — low-cost Electric core",
    teamCost: "Low",
    investment: "Medium",
    signatureImportance: "Medium",
    alternatives: ["Miyabi for higher ceiling", "Anton for lower rarity investment"],
  },
  {
    id: "evelyn-pull",
    name: "Evelyn",
    bannerStatus: "Upcoming",
    dateLabel: "Expected Feb 12, 2025",
    role: "Main DPS",
    style: "Fire DPS",
    pullValue: "Medium",
    f2pFriendliness: "Medium",
    pullIf: [
      "You want a Fire carry",
      "You can support a premium hypercarry core",
      "You value single-target burst",
    ],
    lowerPriorityIf: [
      "You already have enough Fire damage",
      "You need a cheaper team first",
      "Your support core is not ready",
    ],
    bestForAccounts: ["Established rosters", "Fire-focused accounts", "High-investment players"],
    improvesTeams: ["Evelyn Hypercarry", "Fire Burst Core"],
    enablesNewTeamCore: "Yes — premium Fire hypercarry",
    teamCost: "High",
    investment: "High",
    signatureImportance: "Medium to high",
    alternatives: ["Miyabi for broader account impact", "Harumasa for lower cost"],
  },
];

export const filterOptions = {
  combatRole: ["All", ...new Set(agents.map((agent) => agent.combatRole))],
  specialty: ["All", ...new Set(agents.map((agent) => agent.specialty))],
  attribute: ["All", ...new Set(agents.map((agent) => agent.attribute))],
  faction: ["All", ...new Set(agents.map((agent) => agent.faction))],
  rarity: ["All", ...new Set(agents.map((agent) => agent.rarity))],
} as const;
