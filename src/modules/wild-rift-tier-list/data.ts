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
export type SourceType = "official_patch" | "ranked_statistics" | "editorial_review";

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
    id: "riot-7-3c",
    name: "Riot Games · Wild Rift Patch Notes 7.3c",
    type: "official_patch",
    checkedAt: "2026-10-28",
    url: "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3c/",
    context:
      "Current game version. Patch 7.3c is focused on AAA ARAM rather than standard Ranked balance.",
  },
  {
    id: "riot-7-3b",
    name: "Riot Games · Wild Rift Patch Notes 7.3b",
    type: "official_patch",
    checkedAt: "2026-10-28",
    url: "https://wildrift.leagueoflegends.com/en-us/news/game-updates/wild-rift-patch-notes-7-3b/",
    context:
      "Latest patch in the current cycle with direct standard Ranked champion, item, rune, and jungle balance changes.",
  },
  {
    id: "tencent-master",
    name: "Wild Rift Core · Tencent CN Ranked Statistics",
    type: "ranked_statistics",
    checkedAt: "2026-10-28",
    url: "https://wildriftcore.com/en/rankings/",
    context:
      "Wild Rift Core reports Tencent China-server data · Master+ · Ranked · source update label 2026-10-26. 181 role placements, 136 distinct champions counted in the tables; the source headline says 134. Not independently fetched from Tencent.",
  },
  {
    id: "core-editorial-tier",
    name: "Wild Rift Core · Editorial Role Tier List & History",
    type: "editorial_review",
    checkedAt: "2026-10-28",
    url: "https://wildriftcore.com/en/tierlist/",
    context:
      "Source tiers and dated movements are Wild Rift Core editorial judgements, not Riot or Tencent official tiers. Same publisher as the statistics page; not independent corroboration. TierListBase retains these source tiers after role review; no overrides in this snapshot.",
  },
  {
    id: "editorial-review",
    name: "TierListBase Editorial Review",
    type: "editorial_review",
    checkedAt: "2026-10-28",
    url: "/about#about-process-title",
    context:
      "TierListBase editorial role assessments and signals. This snapshot retains Wild Rift Core source tiers with no overrides; no independent TierListBase statistical tier formula is claimed.",
  },
] as const;

export const champions: readonly Champion[] = championCatalog.map((champion) => ({
  ...champion,
  portrait: `/images/wild-rift/champions/${champion.slug}.${champion.id === "norra" ? "svg" : "png"}`,
  portraitKind: champion.id === "norra" ? "placeholder" : "champion",
}));

const championById = new Map(champions.map((champion) => [champion.id, champion]));

// The publisher reports dated tier movements, but does not evidence the causal reasons
// previously shown here. Keep those records in docs/wild-rift/change-audit.json;
// none currently clears the full publication evidence gate.
export const changes: readonly RankingChange[] = [];

const directPatchImpact: Readonly<Record<string, string>> = {
  jhin: "Patch 7.3b increased Jhin's critical damage and brought his missing-health damage scaling online earlier. The effect on this placement is not causally measured.",
  tryndamere:
    "Patch 7.3b improved Tryndamere's critical chance per Fury and Spinning Slash damage. The effect on this placement is not causally measured.",
  nocturne:
    "Patch 7.3b directly nerfed Nocturne's durability, early Duskbringer damage, and Paranoia availability. Patch 7.3c has no standard Ranked follow-up.",
  hwei: "Patch 7.3b directly reduced multiple Hwei damage, shield, and control values. Patch 7.3c has no standard Ranked follow-up.",
  yasuo:
    "Patch 7.3b directly buffed Yasuo's standard critical damage and passive shield. Patch 7.3c has no standard Ranked follow-up.",
  volibear:
    "Patch 7.3b directly adjusted Volibear upward. No causal effect on this placement is claimed.",
  yunara:
    "Patch 7.3b directly reduced Yunara's passive damage and later ultimate availability. No causal effect on this placement is claimed.",
  senna:
    "Patch 7.3b directly reduced Senna's critical damage, Mist attack-damage gain, and Q damage. No causal effect on this placement is claimed.",
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
  const whyThisTier = `${review.rationale} ${statisticalContext} TierListBase retains Wild Rift Core's ${tier} source tier for ${roleLabels[role]} after this editorial review.`;

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
      "No direct standard Ranked change is recorded for this champion in 7.3b. Patch 7.3c is AAA ARAM-focused, so the current placement is driven by the reviewed Ranked snapshot and role context.",
    sourceIds: [
      "core-editorial-tier",
      ...(seed.placementKind === "statistics-backed" ? ["tencent-master"] : []),
      "editorial-review",
      ...(directPatchImpact[seed.championId] ? ["riot-7-3b"] : []),
    ],
  };
}

export const rankings: readonly ChampionRoleRanking[] = rankingSeeds.map(makeRanking);

export const quickPickChampionIds: Readonly<Record<RoleKey, string>> = {
  baron: "malphite",
  jungle: "nocturne",
  mid: "hwei",
  dragon: "ashe",
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
