export const roleKeys = ["baron", "jungle", "mid", "dragon", "support"] as const;
export type RoleKey = (typeof roleKeys)[number];

export const tiers = ["S+", "S", "A", "B", "C"] as const;
export type Tier = (typeof tiers)[number];

export type SignalLevel = "High" | "Medium" | "Low";
export type Trend = "up" | "down" | "flat" | "unavailable";
export type SourceType = "official_patch" | "ranked_statistics" | "editorial_review";

export type Champion = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly portrait: string;
  readonly archetype:
    | "tank"
    | "fighter"
    | "poke"
    | "assassin"
    | "mage"
    | "marksman"
    | "support-tank"
    | "support-assassin";
  readonly strengths: readonly string[];
  readonly limitations: readonly string[];
};

export type DecisionSignals = {
  readonly soloQueueReliability: SignalLevel;
  readonly blindPickSafety: SignalLevel;
  readonly easeOfExecution: SignalLevel;
  readonly carryImpactPotential: SignalLevel;
  readonly teamDependence: SignalLevel;
};

export type ChampionRoleRanking = {
  readonly championId: string;
  readonly role: RoleKey;
  readonly tier: Tier;
  readonly winRate: number;
  readonly pickRate: number;
  readonly banRate: number;
  readonly trend: Trend;
  readonly whyThisTier: string;
  readonly strengths: readonly string[];
  readonly limitations: readonly string[];
  readonly decisionSignals: DecisionSignals;
  readonly patchImpact: string;
  readonly sourceIds: readonly string[];
};

export type RankingChange = {
  readonly championId: string;
  readonly role: RoleKey;
  readonly from: Tier;
  readonly to: Tier;
  readonly type: "Buff" | "Nerf" | "Meta shift" | "Data trend";
  readonly date: string;
  readonly reason: string;
};

export type EvidenceSource = {
  readonly id: string;
  readonly name: string;
  readonly type: SourceType;
  readonly checkedAt: string;
  readonly url: string;
  readonly context: string;
};

export const snapshot = {
  gameVersion: "7.3c",
  latestRankedBalance: "7.3b",
  snapshotDate: "2026-10-26",
  reviewedAt: "2026-10-28",
  region: "CN",
  rankContext: "Master+",
  queueContext: "Ranked",
  focus: "Solo Queue Focus",
} as const;

export const roleLabels: Readonly<Record<RoleKey, string>> = {
  baron: "Baron Lane",
  jungle: "Jungle",
  mid: "Mid Lane",
  dragon: "Dragon Lane",
  support: "Support",
};

export const roleAliases: Readonly<Record<RoleKey, string | null>> = {
  baron: "Solo / Top",
  jungle: null,
  mid: null,
  dragon: "ADC / Duo",
  support: null,
};

export const tierDefinitions: Readonly<Record<Tier, string>> = {
  "S+": "Meta-defining impact, high reliability, and strong draft priority.",
  S: "Very strong and consistently valuable in current Ranked.",
  A: "Strong and viable with clear role value in the current meta.",
  B: "Situational or less consistent than the higher-priority options.",
  C: "Niche, difficult, or currently weak relative to alternatives.",
};

export const roleCriteria: Readonly<Record<RoleKey, readonly string[]>> = {
  baron: [
    "Lane strength",
    "Matchup and blind-pick safety",
    "Side-lane pressure",
    "Scaling",
    "Teamfight contribution",
    "Independence",
  ],
  jungle: [
    "Clear speed",
    "Early tempo",
    "Gank pressure",
    "Objective control",
    "Path reliability",
    "Fallback value",
  ],
  mid: [
    "Wave control",
    "Lane pressure",
    "Roaming",
    "Map influence",
    "Burst or control",
    "Scaling",
  ],
  dragon: [
    "Lane stability",
    "Sustained DPS",
    "Scaling",
    "Range",
    "Survivability",
    "Support synergy",
  ],
  support: [
    "Engage",
    "Peel",
    "Roaming",
    "Utility",
    "Map-control contribution",
    "Low-economy value",
  ],
};

export const sources: readonly EvidenceSource[] = [
  {
    id: "riot-7-3c",
    name: "Riot Games · Wild Rift Patch Notes 7.3c",
    type: "official_patch",
    checkedAt: "2026-10-28",
    url: "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3c/",
    context: "Current game version. This update is focused on AAA ARAM rather than standard Ranked.",
  },
  {
    id: "riot-7-3b",
    name: "Riot Games · Wild Rift Patch Notes 7.3b",
    type: "official_patch",
    checkedAt: "2026-10-28",
    url: "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3b/",
    context: "Latest balance patch directly affecting standard Ranked champions, items, runes, and jungle.",
  },
  {
    id: "tencent-master",
    name: "Tencent CN Ranked Statistics",
    type: "ranked_statistics",
    checkedAt: "2026-10-28",
    url: "https://wildriftcore.com/en/rankings/",
    context: "Official Tencent CN ladder statistics · Master+ · Ranked · snapshot dated 2026-10-26.",
  },
  {
    id: "editorial-review",
    name: "TierListBase Editorial Review",
    type: "editorial_review",
    checkedAt: "2026-10-28",
    url: "/about#about-process-title",
    context: "Role-specific interpretation and cross-check. Win rate alone does not determine Tier.",
  },
] as const;

export const champions: readonly Champion[] = [
  {
    id: "malphite",
    slug: "malphite",
    name: "Malphite",
    portrait: "/images/wild-rift/champions/malphite.png",
    archetype: "tank",
    strengths: ["Reliable long-range engage", "Durable frontline with strong armor scaling"],
    limitations: ["Ultimate windows are predictable", "Magic-heavy drafts reduce his defensive edge"],
  },
  {
    id: "mordekaiser",
    slug: "mordekaiser",
    name: "Mordekaiser",
    portrait: "/images/wild-rift/champions/mordekaiser.png",
    archetype: "fighter",
    strengths: ["Sustained isolated dueling", "Durable AP damage in extended fights"],
    limitations: ["Short range before contact", "Mobile carries can kite him"],
  },
  {
    id: "ksante",
    slug: "ksante",
    name: "K'Sante",
    portrait: "/images/wild-rift/champions/ksante.png",
    archetype: "tank",
    strengths: ["Flexible frontline and displacement", "Strong skirmish control"],
    limitations: ["High execution burden", "Mispositioning makes his all-out windows risky"],
  },
  {
    id: "darius",
    slug: "darius",
    name: "Darius",
    portrait: "/images/wild-rift/champions/darius.png",
    archetype: "fighter",
    strengths: ["Punishing lane pressure", "High reset threat in extended fights"],
    limitations: ["Limited gap closing", "Vulnerable to coordinated kiting"],
  },
  {
    id: "jayce",
    slug: "jayce",
    name: "Jayce",
    portrait: "/images/wild-rift/champions/jayce.png",
    archetype: "poke",
    strengths: ["Strong lane pressure and ranged poke", "Flexible melee and ranged trading"],
    limitations: ["Execution intensive", "Loses value when early pressure fails"],
  },
  {
    id: "sion",
    slug: "sion",
    name: "Sion",
    portrait: "/images/wild-rift/champions/sion.png",
    archetype: "tank",
    strengths: ["Durable engage and wave control", "Persistent side-lane pressure"],
    limitations: ["Engage pattern is telegraphed", "Percent-health damage punishes his health stack"],
  },
  {
    id: "garen",
    slug: "garen",
    name: "Garen",
    portrait: "/images/wild-rift/champions/garen.png",
    archetype: "fighter",
    strengths: ["Simple durable lane pattern", "Reliable execute threat"],
    limitations: ["Limited ranged access", "Predictable teamfight entry"],
  },
  {
    id: "nocturne",
    slug: "nocturne",
    name: "Nocturne",
    portrait: "/images/wild-rift/champions/nocturne.png",
    archetype: "assassin",
    strengths: ["Fast map access with Paranoia", "Strong isolated pick pressure"],
    limitations: ["7.3b reduced durability and damage", "Failed first engage leaves limited fallback"],
  },
  {
    id: "rammus",
    slug: "rammus",
    name: "Rammus",
    portrait: "/images/wild-rift/champions/rammus.png",
    archetype: "tank",
    strengths: ["Excellent anti-AD durability", "Fast ganks with reliable crowd control"],
    limitations: ["Draft-sensitive into magic damage", "Needs lane follow-up for fast kills"],
  },
  {
    id: "jarvan-iv",
    slug: "jarvan-iv",
    name: "Jarvan IV",
    portrait: "/images/wild-rift/champions/jarvan-iv.png",
    archetype: "fighter",
    strengths: ["Reliable early gank setup", "Strong objective and terrain control"],
    limitations: ["Engage can overcommit", "Damage scaling is modest without a lead"],
  },
  {
    id: "chogath",
    slug: "chogath",
    name: "Cho'Gath",
    portrait: "/images/wild-rift/champions/chogath.png",
    archetype: "tank",
    strengths: ["Objective secure and health scaling", "Frontline crowd control"],
    limitations: ["Key control is dodgeable", "Large hitbox increases kite risk"],
  },
  {
    id: "xin-zhao",
    slug: "xin-zhao",
    name: "Xin Zhao",
    portrait: "/images/wild-rift/champions/xin-zhao.png",
    archetype: "fighter",
    strengths: ["Strong early duels", "Reliable access to priority targets"],
    limitations: ["Needs tempo to maximize value", "Can be outscaled by dedicated carries"],
  },
  {
    id: "vi",
    slug: "vi",
    name: "Vi",
    portrait: "/images/wild-rift/champions/vi.png",
    archetype: "fighter",
    strengths: ["Reliable single-target lockdown", "Straightforward gank setup"],
    limitations: ["Engage path is predictable", "Can be punished after committing"],
  },
  {
    id: "lee-sin",
    slug: "lee-sin",
    name: "Lee Sin",
    portrait: "/images/wild-rift/champions/lee-sin.png",
    archetype: "assassin",
    strengths: ["High early playmaking ceiling", "Exceptional mobility and displacement"],
    limitations: ["High execution burden", "Current Master+ results lag safer jungle options"],
  },
  {
    id: "hwei",
    slug: "hwei",
    name: "Hwei",
    portrait: "/images/wild-rift/champions/hwei.png",
    archetype: "mage",
    strengths: ["Long-range control and zone coverage", "Flexible spell utility"],
    limitations: ["7.3b reduced damage, shields, and control", "High spell-selection burden"],
  },
  {
    id: "brand",
    slug: "brand",
    name: "Brand",
    portrait: "/images/wild-rift/champions/brand.png",
    archetype: "mage",
    strengths: ["High area damage", "Punishes grouped teams"],
    limitations: ["Low mobility", "Vulnerable to dive and flank pressure"],
  },
  {
    id: "orianna",
    slug: "orianna",
    name: "Orianna",
    portrait: "/images/wild-rift/champions/orianna.png",
    archetype: "mage",
    strengths: ["Safe wave control", "Reliable teamfight zone control"],
    limitations: ["Positioning dependent", "Lower solo pick threat than assassins"],
  },
  {
    id: "ahri",
    slug: "ahri",
    name: "Ahri",
    portrait: "/images/wild-rift/champions/ahri.png",
    archetype: "assassin",
    strengths: ["Safe mobility and pick creation", "Strong roaming windows"],
    limitations: ["Current reviewed tier has fallen from S", "Charm accuracy drives conversion"],
  },
  {
    id: "viktor",
    slug: "viktor",
    name: "Viktor",
    portrait: "/images/wild-rift/champions/viktor.png",
    archetype: "mage",
    strengths: ["Strong scaling zone control", "Excellent choke-point damage"],
    limitations: ["Slower early map impact", "Needs item progression"],
  },
  {
    id: "yasuo",
    slug: "yasuo",
    name: "Yasuo",
    portrait: "/images/wild-rift/champions/yasuo.png",
    archetype: "fighter",
    strengths: ["High mobility around waves", "Strong critical scaling and knock-up follow-up"],
    limitations: ["Low current Master+ win rate", "Draft and execution dependent"],
  },
  {
    id: "ashe",
    slug: "ashe",
    name: "Ashe",
    portrait: "/images/wild-rift/champions/ashe.png",
    archetype: "marksman",
    strengths: ["Range, slows, and global engage", "Useful utility even when behind"],
    limitations: ["Limited mobility", "Needs protection against hard dive"],
  },
  {
    id: "smolder",
    slug: "smolder",
    name: "Smolder",
    portrait: "/images/wild-rift/champions/smolder.png",
    archetype: "marksman",
    strengths: ["Strong scaling and execute pressure", "Safe ranged damage pattern"],
    limitations: ["Needs stacks and time", "Lower early agency"],
  },
  {
    id: "samira",
    slug: "samira",
    name: "Samira",
    portrait: "/images/wild-rift/champions/samira.png",
    archetype: "marksman",
    strengths: ["High all-in reset potential", "Strong close-range burst"],
    limitations: ["Short effective range", "Needs engage support to access fights safely"],
  },
  {
    id: "kalista",
    slug: "kalista",
    name: "Kalista",
    portrait: "/images/wild-rift/champions/kalista.png",
    archetype: "marksman",
    strengths: ["Lane pressure and combat mobility", "Objective control with Rend"],
    limitations: ["High mechanical burden", "Slows heavily reduce her mobility"],
  },
  {
    id: "jinx",
    slug: "jinx",
    name: "Jinx",
    portrait: "/images/wild-rift/champions/jinx.png",
    archetype: "marksman",
    strengths: ["Excellent reset snowball", "Strong late-fight range and DPS"],
    limitations: ["Immobile before a reset", "Needs frontline and peel"],
  },
  {
    id: "miss-fortune",
    slug: "miss-fortune",
    name: "Miss Fortune",
    portrait: "/images/wild-rift/champions/miss-fortune.png",
    archetype: "marksman",
    strengths: ["Strong lane poke", "High area damage through Bullet Time"],
    limitations: ["Ultimate can be interrupted", "Low mobility"],
  },
  {
    id: "draven",
    slug: "draven",
    name: "Draven",
    portrait: "/images/wild-rift/champions/draven.png",
    archetype: "marksman",
    strengths: ["Huge early lane pressure", "Snowballing cash-in threat"],
    limitations: ["High execution burden", "Punishing when early cash-ins fail"],
  },
  {
    id: "braum",
    slug: "braum",
    name: "Braum",
    portrait: "/images/wild-rift/champions/braum.png",
    archetype: "support-tank",
    strengths: ["Elite peel and projectile denial", "Reliable passive crowd control"],
    limitations: ["Needs teammate follow-up", "Low solo kill pressure"],
  },
  {
    id: "leona",
    slug: "leona",
    name: "Leona",
    portrait: "/images/wild-rift/champions/leona.png",
    archetype: "support-tank",
    strengths: ["Reliable hard engage", "High early kill pressure"],
    limitations: ["No easy disengage after commitment", "Needs teammates to follow the engage"],
  },
  {
    id: "pyke",
    slug: "pyke",
    name: "Pyke",
    portrait: "/images/wild-rift/champions/pyke.png",
    archetype: "support-assassin",
    strengths: ["High roaming pick pressure", "Execute resets convert skirmishes"],
    limitations: ["Fragile when caught", "Value is volatile in stalled teamfights"],
  },
  {
    id: "nautilus",
    slug: "nautilus",
    name: "Nautilus",
    portrait: "/images/wild-rift/champions/nautilus.png",
    archetype: "support-tank",
    strengths: ["Point-and-click lockdown", "Strong layered engage"],
    limitations: ["Can overcommit into bad fights", "Large hitbox makes poke costly"],
  },
  {
    id: "lux",
    slug: "lux",
    name: "Lux",
    portrait: "/images/wild-rift/champions/lux.png",
    archetype: "mage",
    strengths: ["Long-range poke and binding", "Safe lane pressure"],
    limitations: ["Low durability", "Skillshot accuracy drives impact"],
  },
] as const;

const signalsByArchetype: Readonly<Record<Champion["archetype"], DecisionSignals>> = {
  tank: {
    soloQueueReliability: "High",
    blindPickSafety: "High",
    easeOfExecution: "Medium",
    carryImpactPotential: "Medium",
    teamDependence: "Medium",
  },
  fighter: {
    soloQueueReliability: "High",
    blindPickSafety: "Medium",
    easeOfExecution: "Medium",
    carryImpactPotential: "High",
    teamDependence: "Medium",
  },
  poke: {
    soloQueueReliability: "Medium",
    blindPickSafety: "Medium",
    easeOfExecution: "Low",
    carryImpactPotential: "High",
    teamDependence: "Medium",
  },
  assassin: {
    soloQueueReliability: "Medium",
    blindPickSafety: "Low",
    easeOfExecution: "Low",
    carryImpactPotential: "High",
    teamDependence: "Medium",
  },
  mage: {
    soloQueueReliability: "High",
    blindPickSafety: "High",
    easeOfExecution: "Medium",
    carryImpactPotential: "High",
    teamDependence: "Medium",
  },
  marksman: {
    soloQueueReliability: "High",
    blindPickSafety: "Medium",
    easeOfExecution: "Medium",
    carryImpactPotential: "High",
    teamDependence: "High",
  },
  "support-tank": {
    soloQueueReliability: "High",
    blindPickSafety: "High",
    easeOfExecution: "High",
    carryImpactPotential: "Medium",
    teamDependence: "Medium",
  },
  "support-assassin": {
    soloQueueReliability: "Medium",
    blindPickSafety: "Low",
    easeOfExecution: "Low",
    carryImpactPotential: "High",
    teamDependence: "Medium",
  },
};

const patchImpactByChampion: Readonly<Record<string, string>> = {
  nocturne:
    "7.3c has no standard Ranked balance change. In 7.3b, Nocturne lost health scaling, early Duskbringer damage, and gained a longer Paranoia cooldown.",
  hwei:
    "7.3c has no standard Ranked balance change. In 7.3b, Hwei received lower passive damage, shields, crowd-control range, and several spell damage reductions.",
  yasuo:
    "7.3c has no standard Ranked balance change. In 7.3b, Yasuo's standard critical damage and passive shield were increased.",
};

type RankingInput = {
  championId: string;
  role: RoleKey;
  tier: Tier;
  winRate: number;
  pickRate: number;
  banRate: number;
  trend?: Trend;
};

const rankingInputs: readonly RankingInput[] = [
  { championId: "malphite", role: "baron", tier: "S+", winRate: 54.8, pickRate: 8.0, banRate: 44.5 },
  { championId: "mordekaiser", role: "baron", tier: "S+", winRate: 51.3, pickRate: 10.9, banRate: 34.1 },
  { championId: "ksante", role: "baron", tier: "S", winRate: 51.4, pickRate: 8.0, banRate: 18.2 },
  { championId: "darius", role: "baron", tier: "A", winRate: 49.3, pickRate: 15.3, banRate: 13.4 },
  { championId: "jayce", role: "baron", tier: "A", winRate: 50.8, pickRate: 4.6, banRate: 3.1, trend: "up" },
  { championId: "sion", role: "baron", tier: "B", winRate: 49.4, pickRate: 2.4, banRate: 0.3, trend: "down" },
  { championId: "garen", role: "baron", tier: "C", winRate: 48.6, pickRate: 12.3, banRate: 2.3, trend: "down" },

  { championId: "nocturne", role: "jungle", tier: "S+", winRate: 52.7, pickRate: 6.7, banRate: 67.4 },
  { championId: "rammus", role: "jungle", tier: "S+", winRate: 56.2, pickRate: 4.2, banRate: 7.7 },
  { championId: "jarvan-iv", role: "jungle", tier: "S", winRate: 52.5, pickRate: 7.3, banRate: 0.5 },
  { championId: "chogath", role: "jungle", tier: "S", winRate: 50.1, pickRate: 8.2, banRate: 38.4, trend: "up" },
  { championId: "xin-zhao", role: "jungle", tier: "A", winRate: 50.7, pickRate: 9.1, banRate: 1.6 },
  { championId: "vi", role: "jungle", tier: "B", winRate: 49.4, pickRate: 5.0, banRate: 0.9, trend: "down" },
  { championId: "lee-sin", role: "jungle", tier: "C", winRate: 46.6, pickRate: 12.9, banRate: 7.2 },

  { championId: "hwei", role: "mid", tier: "S+", winRate: 52.5, pickRate: 6.0, banRate: 51.9 },
  { championId: "brand", role: "mid", tier: "S+", winRate: 52.5, pickRate: 10.8, banRate: 10.4 },
  { championId: "orianna", role: "mid", tier: "S", winRate: 51.7, pickRate: 4.9, banRate: 0.3 },
  { championId: "malphite", role: "mid", tier: "S", winRate: 50.6, pickRate: 1.0, banRate: 44.5, trend: "up" },
  { championId: "ahri", role: "mid", tier: "A", winRate: 50.4, pickRate: 4.6, banRate: 0.1, trend: "down" },
  { championId: "viktor", role: "mid", tier: "B", winRate: 49.9, pickRate: 3.0, banRate: 0.5 },
  { championId: "yasuo", role: "mid", tier: "C", winRate: 46.9, pickRate: 8.3, banRate: 8.7 },

  { championId: "ashe", role: "dragon", tier: "S+", winRate: 53.4, pickRate: 9.6, banRate: 0.2, trend: "up" },
  { championId: "smolder", role: "dragon", tier: "S+", winRate: 52.3, pickRate: 8.9, banRate: 3.7, trend: "up" },
  { championId: "samira", role: "dragon", tier: "S", winRate: 51.0, pickRate: 11.9, banRate: 11.2, trend: "up" },
  { championId: "kalista", role: "dragon", tier: "S", winRate: 50.6, pickRate: 7.6, banRate: 10.2, trend: "up" },
  { championId: "jinx", role: "dragon", tier: "A", winRate: 50.5, pickRate: 13.3, banRate: 0.5 },
  { championId: "miss-fortune", role: "dragon", tier: "B", winRate: 48.6, pickRate: 12.8, banRate: 2.0, trend: "down" },
  { championId: "draven", role: "dragon", tier: "C", winRate: 46.8, pickRate: 5.1, banRate: 1.7 },

  { championId: "malphite", role: "support", tier: "S+", winRate: 51.4, pickRate: 9.2, banRate: 44.5 },
  { championId: "hwei", role: "support", tier: "S+", winRate: 51.8, pickRate: 1.4, banRate: 51.9, trend: "up" },
  { championId: "braum", role: "support", tier: "S+", winRate: 52.5, pickRate: 4.9, banRate: 1.3 },
  { championId: "leona", role: "support", tier: "S", winRate: 51.9, pickRate: 11.2, banRate: 7.2 },
  { championId: "pyke", role: "support", tier: "A", winRate: 50.0, pickRate: 3.6, banRate: 2.6, trend: "up" },
  { championId: "nautilus", role: "support", tier: "B", winRate: 49.4, pickRate: 13.7, banRate: 4.4, trend: "down" },
  { championId: "lux", role: "support", tier: "C", winRate: 49.1, pickRate: 8.0, banRate: 13.9 },
] as const;

const championById = new Map(champions.map((champion) => [champion.id, champion]));

function makeRanking(input: RankingInput): ChampionRoleRanking {
  const champion = championById.get(input.championId);
  if (!champion) throw new Error(`Unknown Wild Rift champion: ${input.championId}`);
  const criteria = roleCriteria[input.role];
  const patchImpact =
    patchImpactByChampion[input.championId] ??
    "No direct Ranked change in 7.3b. Patch 7.3c is AAA ARAM-only, so this placement is based on the current Ranked snapshot and role review.";
  return {
    ...input,
    trend: input.trend ?? "unavailable",
    whyThisTier: `${champion.name} is ${input.tier} in ${roleLabels[input.role]} after combining ${input.winRate.toFixed(
      1,
    )}% WR, ${input.pickRate.toFixed(1)}% PR and ${input.banRate.toFixed(
      1,
    )}% BR with ${criteria[0].toLowerCase()}, ${criteria[1].toLowerCase()}, and solo-queue reliability.`,
    strengths: champion.strengths,
    limitations: champion.limitations,
    decisionSignals: signalsByArchetype[champion.archetype],
    patchImpact,
    sourceIds: [
      "tencent-master",
      "editorial-review",
      ...(patchImpactByChampion[input.championId] ? ["riot-7-3b"] : []),
    ],
  };
}

export const rankings: readonly ChampionRoleRanking[] = rankingInputs.map(makeRanking);

export const quickPickChampionIds: Readonly<Record<RoleKey, string>> = {
  baron: "malphite",
  jungle: "nocturne",
  mid: "hwei",
  dragon: "ashe",
  support: "braum",
};

export const quickInsights: Readonly<
  Record<
    RoleKey,
    readonly {
      readonly label:
        | "Best Blind Pick"
        | "Best Easy Climb Pick"
        | "Highest Draft Priority"
        | "Biggest Riser";
      readonly championId: string;
      readonly reason: string;
    }[]
  >
> = {
  baron: [
    { label: "Best Blind Pick", championId: "malphite", reason: "Reliable engage and a 54.8% Master+ win rate keep him stable across drafts." },
    { label: "Best Easy Climb Pick", championId: "darius", reason: "Straightforward lane punishment and reset threat reward consistent execution." },
    { label: "Highest Draft Priority", championId: "mordekaiser", reason: "High pick and ban pressure reflects strong current Baron relevance." },
    { label: "Biggest Riser", championId: "jayce", reason: "The reviewed role snapshot moved Jayce from C to A on Oct 19." },
  ],
  jungle: [
    { label: "Best Blind Pick", championId: "jarvan-iv", reason: "Reliable gank setup and terrain control keep value even without a snowball." },
    { label: "Best Easy Climb Pick", championId: "rammus", reason: "Simple engage patterns and 56.2% Master+ WR make him a high-floor choice." },
    { label: "Highest Draft Priority", championId: "nocturne", reason: "Paranoia pressure remains draft-warping despite the 7.3b nerf." },
    { label: "Biggest Riser", championId: "chogath", reason: "The reviewed role snapshot moved Cho'Gath from B to S during patch 7.3." },
  ],
  mid: [
    { label: "Best Blind Pick", championId: "orianna", reason: "Wave control and teamfight utility give her a stable answer into many drafts." },
    { label: "Best Easy Climb Pick", championId: "brand", reason: "High area damage converts grouped fights without requiring complex mobility." },
    { label: "Highest Draft Priority", championId: "hwei", reason: "52.5% WR with 51.9% ban rate keeps Hwei highly contested after 7.3b." },
    { label: "Biggest Riser", championId: "malphite", reason: "Malphite moved from B to S in the reviewed Mid snapshot on Oct 27." },
  ],
  dragon: [
    { label: "Best Blind Pick", championId: "ashe", reason: "Range, utility, and 53.4% WR make Ashe useful across many support pairings." },
    { label: "Best Easy Climb Pick", championId: "jinx", reason: "Clear front-to-back execution and reset scaling offer a simple win condition." },
    { label: "Highest Draft Priority", championId: "smolder", reason: "S+ scaling and safe damage give Smolder strong current carry priority." },
    { label: "Biggest Riser", championId: "kalista", reason: "Kalista moved from B to S in the reviewed Dragon snapshot on Oct 25." },
  ],
  support: [
    { label: "Best Blind Pick", championId: "braum", reason: "Peel, projectile denial, and strong Master+ results fit many team shapes." },
    { label: "Best Easy Climb Pick", championId: "leona", reason: "Reliable engage and a simple CC chain make fight starts easy to communicate." },
    { label: "Highest Draft Priority", championId: "hwei", reason: "The current snapshot marks support Hwei S+ with very high shared ban pressure." },
    { label: "Biggest Riser", championId: "pyke", reason: "The current reviewed snapshot marks Pyke up from B into A." },
  ],
};

export const changes: readonly RankingChange[] = [
  {
    championId: "jayce",
    role: "baron",
    from: "C",
    to: "A",
    type: "Meta shift",
    date: "2026-10-19",
    reason: "Recent ranked results and lane pressure improved enough to hold an A placement.",
  },
  {
    championId: "sion",
    role: "baron",
    from: "S",
    to: "B",
    type: "Data trend",
    date: "2026-10-21",
    reason: "Current Master+ performance no longer supports his earlier S placement.",
  },
  {
    championId: "garen",
    role: "baron",
    from: "S",
    to: "C",
    type: "Data trend",
    date: "2026-10-27",
    reason: "The latest reviewed Baron snapshot shows a sustained drop in relative priority.",
  },
  {
    championId: "chogath",
    role: "jungle",
    from: "B",
    to: "S",
    type: "Meta shift",
    date: "2026-10-01",
    reason: "Objective control and frontline reliability gained value after the 7.3 jungle changes.",
  },
  {
    championId: "malphite",
    role: "mid",
    from: "B",
    to: "S",
    type: "Data trend",
    date: "2026-10-27",
    reason: "The current Master+ sample supports substantially higher Mid impact than earlier in 7.3.",
  },
  {
    championId: "ahri",
    role: "mid",
    from: "S",
    to: "A",
    type: "Data trend",
    date: "2026-10-27",
    reason: "Stable utility remains, but current results and priority are below the S group.",
  },
  {
    championId: "ashe",
    role: "dragon",
    from: "A",
    to: "S+",
    type: "Meta shift",
    date: "2026-10-17",
    reason: "Utility plus sustained damage became one of the most reliable Dragon Lane packages.",
  },
  {
    championId: "kalista",
    role: "dragon",
    from: "B",
    to: "S",
    type: "Data trend",
    date: "2026-10-25",
    reason: "Lane pressure and objective conversion improved enough to hold an S placement.",
  },
  {
    championId: "nautilus",
    role: "support",
    from: "S",
    to: "B",
    type: "Meta shift",
    date: "2026-10-15",
    reason: "Engage remains reliable, but current support alternatives deliver more consistent value.",
  },
] as const;

export function championForId(id: string): Champion {
  const champion = championById.get(id);
  if (!champion) throw new Error(`Unknown Wild Rift champion: ${id}`);
  return champion;
}

export function rankingsForRole(role: RoleKey): readonly ChampionRoleRanking[] {
  return rankings.filter((ranking) => ranking.role === role);
}

export function rankingFor(championId: string, role: RoleKey): ChampionRoleRanking | undefined {
  return rankings.find((ranking) => ranking.championId === championId && ranking.role === role);
}

export function otherViableRoles(
  championId: string,
  currentRole: RoleKey,
): readonly ChampionRoleRanking[] {
  return rankings.filter(
    (ranking) => ranking.championId === championId && ranking.role !== currentRole,
  );
}
