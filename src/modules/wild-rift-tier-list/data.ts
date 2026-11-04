import championNotes from "./champion-notes.json";
import roleReviews from "./role-reviews.json";
import { championCatalog, expectedRoleCounts, rankingSeeds } from "./rankings";

export { expectedRoleCounts } from "./rankings";

export const roleKeys = ["baron", "jungle", "mid", "dragon", "support"] as const;
export type RoleKey = (typeof roleKeys)[number];

export const tiers = ["S+", "S", "A", "B", "C"] as const;
export type Tier = (typeof tiers)[number];

export type SignalLevel = "High" | "Medium" | "Low";
export type Trend = "up" | "down" | "flat" | "unavailable";
export type SourceType =
  | "official_patch"
  | "ranked_statistics"
  | "source_tier"
  | "editorial_review";

export type Champion = {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly portrait: string;
  readonly portraitKind: "champion" | "placeholder";
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
  readonly sourceTier: Tier;
  readonly tierSourceId: "core-editorial-tier";
  readonly editorialTierReason: string | null;
  readonly placementKind: "statistics-backed" | "editorial";
  readonly winRateChange7d: number | null;
  readonly winRate: number | null;
  readonly pickRate: number | null;
  readonly banRate: number | null;
  readonly trend: Trend;
  readonly whyThisTier: string;
  readonly abilitySourceUrl: string;
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
  readonly type: "Source tier movement";
  readonly sourceId: "core-editorial-tier";
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
  gameVersion: "7.3d",
  latestRankedBalance: "7.3d",
  snapshotDate: "2026-11-01",
  reviewedAt: "2026-11-03",
  statisticsPatch: "7.3d",
  postBalanceStatisticsVerified: true,
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
  mid: ["Wave control", "Lane pressure", "Roaming", "Map influence", "Burst or control", "Scaling"],
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
    id: "riot-7-3d",
    name: "Riot Games · Wild Rift Patch Notes 7.3d",
    type: "official_patch",
    checkedAt: "2026-11-03",
    url: "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3d/",
    context:
      "Current game version and latest standard Ranked balance, published 2026-10-28. Champion, item, objective, and turret changes. The reviewed statistics snapshot is post-balance and labeled patch 7.3d.",
  },
  {
    id: "riot-7-3c",
    name: "Riot Games · Wild Rift Patch Notes 7.3c",
    type: "official_patch",
    checkedAt: "2026-11-03",
    url: "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3c/",
    context: "Historical patch: 7.3c focused on AAA ARAM; it is not the current game version.",
  },
  {
    id: "riot-7-3b",
    name: "Riot Games · Wild Rift Patch Notes 7.3b",
    type: "official_patch",
    checkedAt: "2026-11-03",
    url: "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3b/",
    context: "Historical standard Ranked balance patch; superseded by 7.3d.",
  },
  {
    id: "tencent-master",
    name: "Wild Rift Core · Tencent CN Ranked Statistics",
    type: "ranked_statistics",
    checkedAt: "2026-11-03",
    url: "https://wildriftcore.com/en/rankings/",
    context:
      "Wild Rift Core reports Tencent China-server data · Master+ · Ranked · source updated 2026-11-01 (7.3d). 179 exact Champion × Role rows cover 136 distinct champions; the source headline says 135 tracked champions, so that discrepancy is preserved. TierListBase did not independently fetch Tencent.",
  },
  {
    id: "core-editorial-tier",
    name: "Wild Rift Core · Source Role Tier List & History",
    type: "source_tier",
    checkedAt: "2026-11-03",
    url: "https://wildriftcore.com/en/tierlist/",
    context:
      "Source tiers are Wild Rift Core's data-informed role ranking, which the source describes as recomputed from Master+ rates, presence, and expert/community consensus. It is not a Riot or Tencent official tier. TierListBase keeps it separate from raw Tencent statistics and from its own Champion × Role editorial signals; no tier overrides are applied.",
  },
  {
    id: "editorial-review",
    name: "TierListBase Editorial Review",
    type: "editorial_review",
    checkedAt: "2026-11-03",
    url: "/about#about-process-title",
    context:
      "TierListBase Champion × Role editorial assessments and decision signals. These are explicitly editorial and are not Tencent statistics or Riot facts. The current snapshot retains Wild Rift Core source tiers with no overrides.",
  },
] as const;

export const champions: readonly Champion[] = championCatalog.map((champion) => ({
  ...champion,
  portrait: `/images/wild-rift/champions/${champion.slug}.png`,
  portraitKind: "champion",
}));

const championById = new Map(champions.map((champion) => [champion.id, champion]));

// The publisher now exposes net source-tier movements with role, previous tier, current tier,
// and date. Publish only those movement facts; do not infer causal reasons from patch notes or
// statistics. The item-level gate is recorded in docs/wild-rift/change-audit.json.
export const changes: readonly RankingChange[] = [
  {
    championId: "gnar",
    role: "baron",
    from: "C",
    to: "A",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-02",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "kogmaw",
    role: "dragon",
    from: "B",
    to: "S",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-01",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "vladimir",
    role: "mid",
    from: "B",
    to: "S",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-01",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "sivir",
    role: "dragon",
    from: "C",
    to: "A",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-01",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "malphite",
    role: "mid",
    from: "B",
    to: "S",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-10-27",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "kalista",
    role: "dragon",
    from: "B",
    to: "S",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-10-25",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "ashe",
    role: "dragon",
    from: "A",
    to: "S+",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-10-17",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "twitch",
    role: "dragon",
    from: "C",
    to: "A",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-10-09",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "miss-fortune",
    role: "dragon",
    from: "S+",
    to: "B",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-10-03",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "volibear",
    role: "baron",
    from: "S+",
    to: "B",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-10-03",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "jhin",
    role: "dragon",
    from: "S",
    to: "B",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-02",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "kassadin",
    role: "mid",
    from: "S+",
    to: "A",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-02",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "yunara",
    role: "dragon",
    from: "S",
    to: "B",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-01",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "garen",
    role: "baron",
    from: "S",
    to: "B",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-01",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "olaf",
    role: "baron",
    from: "S+",
    to: "A",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-11-01",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
  {
    championId: "ahri",
    role: "mid",
    from: "S+",
    to: "A",
    type: "Source tier movement",
    sourceId: "core-editorial-tier",
    date: "2026-10-27",
    reason:
      "Wild Rift Core reports this net source-tier movement since the first 7.3 update; TierListBase does not infer a causal reason.",
  },
];

const directPatchImpact: Readonly<Record<string, string>> = {
  shyvana: "7.3d improves human-form fighting; some dragon bonuses decrease.",
  camille: "7.3d increases attack-speed growth.",
  malphite: "7.3d reduces passive shielding and empowered-attack damage.",
  ekko: "7.3d reduces two abilities' monster-damage modifiers.",
  "lee-sin": "7.3d increases attack-speed growth and ultimate damage.",
  akali: "7.3d increases base armor and attack-speed growth.",
  nasus: "7.3d increases attack damage and later ultimate defenses, but reduces area damage.",
  samira: "7.3d reduces Q and ultimate attack-damage ratios.",
  ashe: "7.3d reduces Frost Shot's bonus attack damage.",
  "miss-fortune": "7.3d improves passive and ultimate damage scaling.",
  singed: "7.3d reduces health and movement speed; control cooldowns increase.",
};

type ChampionNotes = {
  strengths: readonly string[];
  limitations: readonly string[];
  abilitySourceUrl: string;
};
type RoleReview = { rationale: string; signals: string };
const notesByChampion: Readonly<Record<string, ChampionNotes>> = championNotes;
const reviewsByPlacement: Readonly<Record<string, RoleReview>> = roleReviews;
const signalLevels: Readonly<Record<string, SignalLevel>> = { H: "High", M: "Medium", L: "Low" };

function decisionSignals(codes: string): DecisionSignals {
  if (!/^[HML]{5}$/.test(codes))
    throw new Error(`Invalid Wild Rift editorial signal codes: ${codes}`);
  const levels = [...codes].map((code) => signalLevels[code]);
  const [
    soloQueueReliability,
    blindPickSafety,
    easeOfExecution,
    carryImpactPotential,
    teamDependence,
  ] = levels;
  if (
    !soloQueueReliability ||
    !blindPickSafety ||
    !easeOfExecution ||
    !carryImpactPotential ||
    !teamDependence
  ) {
    throw new Error("Incomplete Wild Rift editorial assessment");
  }
  return {
    soloQueueReliability,
    blindPickSafety,
    easeOfExecution,
    carryImpactPotential,
    teamDependence,
  };
}

function makeRanking(seed: (typeof rankingSeeds)[number]): ChampionRoleRanking {
  const role = seed.role;
  const tier = seed.tier;
  const champion = championById.get(seed.championId);
  if (!champion) throw new Error(`Unknown Wild Rift champion: ${seed.championId}`);

  const review = reviewsByPlacement[`${seed.championId}:${role}`];
  const notes = notesByChampion[seed.championId];
  if (!review || !notes)
    throw new Error(`Missing Wild Rift role review: ${seed.championId}:${role}`);
  const statisticalContext =
    seed.winRate === null
      ? "Role statistics unavailable (WR / PR / BR: N/A); this is an editorial placement without inventing missing statistics."
      : `CN Master+ evidence: ${seed.winRate.toFixed(2)}% WR, ${seed.pickRate?.toFixed(2)}% PR, ${seed.banRate?.toFixed(2)}% BR. These observations are not a causal explanation or a tier formula.`;
  const whyThisTier = `${review.rationale} Evidence snapshot: ${snapshot.snapshotDate} · 7.3d · CN Master+. ${statisticalContext} TierListBase retains Wild Rift Core's ${tier} source tier for ${roleLabels[role]} after this separate editorial review.`;

  return {
    championId: seed.championId,
    role,
    tier,
    sourceTier: seed.sourceTier,
    tierSourceId: seed.tierSourceId,
    editorialTierReason: null,
    placementKind: seed.placementKind,
    winRateChange7d: seed.winRateChange7d,
    winRate: seed.winRate,
    pickRate: seed.pickRate,
    banRate: seed.banRate,
    trend:
      seed.winRateChange7d === null
        ? "unavailable"
        : seed.winRateChange7d > 0
          ? "up"
          : seed.winRateChange7d < 0
            ? "down"
            : "flat",
    whyThisTier,
    abilitySourceUrl: notes.abilitySourceUrl,
    strengths: notes.strengths,
    limitations: notes.limitations,
    decisionSignals: decisionSignals(review.signals),
    patchImpact:
      directPatchImpact[seed.championId] ??
      "No direct champion adjustment in 7.3d. Item and objective changes may still matter.",
    sourceIds: [
      "core-editorial-tier",
      ...(seed.placementKind === "statistics-backed" ? ["tencent-master"] : []),
      "editorial-review",
      "riot-7-3d",
    ],
  };
}

export const rankings: readonly ChampionRoleRanking[] = rankingSeeds.map(makeRanking);

export const quickPickChampionIds: Readonly<Record<RoleKey, string>> = {
  baron: "shen",
  jungle: "rammus",
  mid: "hwei",
  dragon: "smolder",
  support: "braum",
};

type QuickInsight = {
  readonly label:
    | "Best Blind Pick"
    | "Best Easy Climb Pick"
    | "Highest Draft Priority"
    | "Biggest Riser";
  readonly championId: string;
  readonly reason: string;
};
const editorialInsightPicks: Readonly<Record<RoleKey, readonly [string, string]>> = {
  baron: ["ornn", "malphite"],
  jungle: ["jarvan-iv", "rammus"],
  mid: ["orianna", "brand"],
  dragon: ["ezreal", "ashe"],
  support: ["braum", "leona"],
};

function insightsForRole(role: RoleKey): readonly QuickInsight[] {
  const [blind, easy] = editorialInsightPicks[role];
  const placements = rankings.filter((ranking) => ranking.role === role);
  const result: QuickInsight[] = [
    {
      label: "Best Blind Pick",
      championId: blind,
      reason: `Editorial choice for flexible ${roleLabels[role]} utility and a workable fallback plan. Matchups and team composition still matter.`,
    },
    {
      label: "Best Easy Climb Pick",
      championId: easy,
      reason: `Editorial choice for a clear, easier-to-execute ${roleLabels[role]} plan. Consult its limitations; this is not a promised climb outcome.`,
    },
  ];
  const priority = placements
    .filter((ranking) => ranking.banRate !== null)
    .sort((a, b) => (b.banRate ?? -1) - (a.banRate ?? -1))[0];
  if (priority)
    result.push({
      label: "Highest Draft Priority",
      championId: priority.championId,
      reason: `Editorial draft-pressure pick: highest reported champion ban rate among this role's statistics-backed candidates (${priority.banRate?.toFixed(2)}%). Ban pressure is champion-wide, not a role-specific ban measurement.`,
    });
  const riser = placements
    .filter((ranking) => ranking.winRateChange7d !== null && ranking.winRateChange7d > 0)
    .sort((a, b) => (b.winRateChange7d ?? 0) - (a.winRateChange7d ?? 0))[0];
  if (riser)
    result.push({
      label: "Biggest Riser",
      championId: riser.championId,
      reason: `Largest available same-role 7-day win-rate gain in the reviewed source: +${riser.winRateChange7d?.toFixed(2)} percentage points. This is not a tier promotion; placements with unavailable trends cannot be compared.`,
    });
  return result;
}

export const quickInsights: Readonly<Record<RoleKey, readonly QuickInsight[]>> = {
  baron: insightsForRole("baron"),
  jungle: insightsForRole("jungle"),
  mid: insightsForRole("mid"),
  dragon: insightsForRole("dragon"),
  support: insightsForRole("support"),
};

if (
  roleKeys.some(
    (role) =>
      rankings.filter((ranking) => ranking.role === role).length !== expectedRoleCounts[role],
  )
) {
  throw new Error("Wild Rift role roster count drift");
}

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
