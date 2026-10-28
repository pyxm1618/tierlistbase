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
  readonly portrait: string | null;
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
  readonly winRate: number | null;
  readonly pickRate: number | null;
  readonly banRate: number | null;
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
      "Role statistics derived from Tencent's official China-server data · Master+ · Ranked · source snapshot dated 2026-10-26.",
  },
  {
    id: "editorial-review",
    name: "TierListBase Editorial Review",
    type: "editorial_review",
    checkedAt: "2026-10-28",
    url: "/about#about-process-title",
    context:
      "Role-specific interpretation and cross-check. Win rate alone does not determine Tier.",
  },
] as const;

export const champions: readonly Champion[] = championCatalog.map((champion) => ({
  ...champion,
  portrait: champion.id === "norra" ? null : `/images/wild-rift/champions/${champion.slug}.png`,
}));

const championById = new Map(champions.map((champion) => [champion.id, champion]));

export const changes: readonly RankingChange[] = [
  {
    championId: "malphite",
    role: "mid",
    from: "B",
    to: "S",
    type: "Data trend",
    date: "2026-10-27",
    reason:
      "The latest reviewed Mid snapshot supports substantially higher priority than earlier in 7.3.",
  },
  {
    championId: "garen",
    role: "baron",
    from: "S",
    to: "C",
    type: "Data trend",
    date: "2026-10-27",
    reason: "The current Baron snapshot shows a sustained drop in relative priority.",
  },
  {
    championId: "ahri",
    role: "mid",
    from: "S+",
    to: "A",
    type: "Data trend",
    date: "2026-10-27",
    reason: "Stable utility remains, but current results and draft priority sit below the S group.",
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
    championId: "sion",
    role: "baron",
    from: "S",
    to: "B",
    type: "Data trend",
    date: "2026-10-21",
    reason: "Current Master+ performance no longer supports the earlier S placement.",
  },
  {
    championId: "jayce",
    role: "baron",
    from: "C",
    to: "A",
    type: "Meta shift",
    date: "2026-10-19",
    reason: "Recent lane and ranked results improved enough to support an A placement.",
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
    championId: "yone",
    role: "baron",
    from: "S+",
    to: "A",
    type: "Data trend",
    date: "2026-10-17",
    reason: "Current Baron results and draft value no longer support the prior top-band placement.",
  },
  {
    championId: "nautilus",
    role: "support",
    from: "S",
    to: "B",
    type: "Meta shift",
    date: "2026-10-15",
    reason:
      "Engage remains reliable, but current support alternatives deliver more consistent value.",
  },
  {
    championId: "olaf",
    role: "baron",
    from: "S",
    to: "B",
    type: "Data trend",
    date: "2026-10-11",
    reason: "The current Baron snapshot places Olaf below the highest-priority lane options.",
  },
  {
    championId: "twitch",
    role: "dragon",
    from: "C",
    to: "A",
    type: "Meta shift",
    date: "2026-10-09",
    reason: "Current Dragon Lane results support a materially stronger carry placement.",
  },
  {
    championId: "dr-mundo",
    role: "baron",
    from: "C",
    to: "A",
    type: "Data trend",
    date: "2026-10-03",
    reason: "The reviewed Baron snapshot now supports a stable A-tier placement.",
  },
  {
    championId: "miss-fortune",
    role: "dragon",
    from: "S+",
    to: "B",
    type: "Data trend",
    date: "2026-10-03",
    reason: "Current Dragon Lane results have fallen well below the former top-band placement.",
  },
  {
    championId: "volibear",
    role: "baron",
    from: "S+",
    to: "B",
    type: "Meta shift",
    date: "2026-10-03",
    reason: "The current Baron environment values safer and more consistent alternatives.",
  },
  {
    championId: "chogath",
    role: "jungle",
    from: "B",
    to: "S",
    type: "Meta shift",
    date: "2026-10-01",
    reason:
      "Objective control and frontline reliability gained value after the 7.3 jungle changes.",
  },
  {
    championId: "samira",
    role: "dragon",
    from: "B",
    to: "S",
    type: "Data trend",
    date: "2026-10-01",
    reason: "Current lane and fight conversion support a stronger S-tier Dragon placement.",
  },
] as const;

const trendByPlacement = new Map<string, Trend>(
  changes.map(
    (change) =>
      [
        `${change.championId}:${change.role}`,
        change.to === change.from ? ("flat" as const) : ("up" as const),
      ] as const,
  ),
);
for (const change of changes) {
  const order = new Map<Tier, number>(tiers.map((tier, index) => [tier, index] as const));
  trendByPlacement.set(
    `${change.championId}:${change.role}`,
    (order.get(change.to) ?? 99) < (order.get(change.from) ?? 99) ? "up" : "down",
  );
}

const directPatchImpact: Readonly<Record<string, string>> = {
  nocturne:
    "Patch 7.3b directly nerfed Nocturne's durability, early Duskbringer damage, and Paranoia availability. Patch 7.3c has no standard Ranked follow-up.",
  hwei: "Patch 7.3b directly reduced multiple Hwei damage, shield, and control values. Patch 7.3c has no standard Ranked follow-up.",
  yasuo:
    "Patch 7.3b directly buffed Yasuo's standard critical damage and passive shield. Patch 7.3c has no standard Ranked follow-up.",
  volibear:
    "Patch 7.3b directly adjusted Volibear upward. The current placement also reflects the post-change Master+ snapshot.",
  yunara:
    "Patch 7.3b directly reduced Yunara's passive damage and later ultimate availability. The current Dragon placement includes that change.",
  senna:
    "Patch 7.3b directly reduced Senna's critical damage, Mist attack-damage gain, and Q damage. The current placement includes that change.",
};

const lowExecutionChampions = new Set([
  "akali",
  "akshan",
  "camille",
  "draven",
  "fiora",
  "irelia",
  "jayce",
  "kalista",
  "katarina",
  "khazix",
  "lee-sin",
  "nidalee",
  "pyke",
  "riven",
  "samira",
  "yasuo",
  "yone",
  "zed",
  "zoe",
]);

const easyExecutionChampions = new Set([
  "amumu",
  "ashe",
  "braum",
  "garen",
  "leona",
  "malphite",
  "rammus",
  "sona",
]);

function tierSignal(tier: Tier): SignalLevel {
  if (tier === "S+" || tier === "S") return "High";
  if (tier === "A" || tier === "B") return "Medium";
  return "Low";
}

function signalsFor(championId: string, role: RoleKey, tier: Tier): DecisionSignals {
  const baseline = tierSignal(tier);
  const execution: SignalLevel = lowExecutionChampions.has(championId)
    ? "Low"
    : easyExecutionChampions.has(championId)
      ? "High"
      : "Medium";

  return {
    soloQueueReliability: baseline,
    blindPickSafety: tier === "S+" ? "High" : tier === "S" || tier === "A" ? "Medium" : "Low",
    easeOfExecution: execution,
    carryImpactPotential:
      role === "jungle" || role === "mid" || role === "dragon" ? baseline : "Medium",
    teamDependence: role === "dragon" ? "High" : role === "support" ? "Medium" : "Low",
  };
}

function stat(value: number | null, label: string): string {
  return value === null ? `N/A ${label}` : `${value.toFixed(1)}% ${label}`;
}

function strengthsFor(
  tier: Tier,
  winRate: number | null,
  pickRate: number | null,
  banRate: number | null,
  role: RoleKey,
): readonly string[] {
  const strengths: string[] = [];
  if (tier === "S+" || tier === "S") {
    strengths.push(`${tier} role placement in the reviewed Master+ snapshot.`);
  }
  if (winRate !== null && winRate >= 52) {
    strengths.push(`Strong current Master+ win-rate signal (${winRate.toFixed(1)}%).`);
  }
  if (pickRate !== null && pickRate >= 8) {
    strengths.push(`Established current role presence (${pickRate.toFixed(1)}% pick rate).`);
  }
  if (banRate !== null && banRate >= 10) {
    strengths.push(`Meaningful current draft pressure (${banRate.toFixed(1)}% ban rate).`);
  }
  strengths.push(
    `Role review explicitly weights ${roleCriteria[role][0].toLowerCase()} and ${roleCriteria[
      role
    ][1].toLowerCase()}.`,
  );
  if (strengths.length < 2) {
    strengths.push(
      "The placement is retained after cross-checking role context against the current patch.",
    );
  }
  return strengths.slice(0, 4);
}

function limitationsFor(
  winRate: number | null,
  pickRate: number | null,
  role: RoleKey,
): readonly string[] {
  const limitations: string[] = [];
  if (winRate === null || pickRate === null) {
    limitations.push(
      "Complete WR / PR / BR values are unavailable for this source entry; no statistics are backfilled.",
    );
  } else {
    if (winRate < 50) {
      limitations.push(
        `Current Master+ win rate is below 50% (${winRate.toFixed(1)}%), so the tier is not a win-rate endorsement.`,
      );
    }
    if (pickRate < 2) {
      limitations.push(
        `Low current pick rate (${pickRate.toFixed(1)}%) makes the role sample less robust than high-volume picks.`,
      );
    }
  }
  limitations.push(
    "This placement is specific to China-server Master+ Ranked and should not be read as a global all-ranks result.",
  );
  if (limitations.length < 2) {
    limitations.push(
      `${roleLabels[role]} value can change when draft needs differ from this reviewed solo-queue context.`,
    );
  }
  return limitations.slice(0, 4);
}

function makeRanking(seed: (typeof rankingSeeds)[number]): ChampionRoleRanking {
  const role = seed.role as RoleKey;
  const tier = seed.tier as Tier;
  const champion = championById.get(seed.championId);
  if (!champion) throw new Error(`Unknown Wild Rift champion: ${seed.championId}`);

  const hasCompleteStats = seed.winRate !== null && seed.pickRate !== null && seed.banRate !== null;
  const whyThisTier = hasCompleteStats
    ? `${champion.name} is ${tier} in ${roleLabels[role]} after combining ${stat(
        seed.winRate,
        "WR",
      )}, ${stat(seed.pickRate, "PR")}, and ${stat(
        seed.banRate,
        "BR",
      )} with role-specific review of ${roleCriteria[role][0].toLowerCase()}, ${roleCriteria[
        role
      ][1].toLowerCase()}, execution burden, and solo-queue reliability.`
    : `${champion.name} is ${tier} in ${
        roleLabels[role]
      } in the reviewed role snapshot. The source entry does not expose complete WR / PR / BR values, so the tier is retained without inventing missing statistics and is cross-checked against role context.`;

  return {
    championId: seed.championId,
    role,
    tier,
    winRate: seed.winRate,
    pickRate: seed.pickRate,
    banRate: seed.banRate,
    trend: trendByPlacement.get(`${seed.championId}:${role}`) ?? "unavailable",
    whyThisTier,
    strengths: strengthsFor(tier, seed.winRate, seed.pickRate, seed.banRate, role),
    limitations: limitationsFor(seed.winRate, seed.pickRate, role),
    decisionSignals: signalsFor(seed.championId, role, tier),
    patchImpact:
      directPatchImpact[seed.championId] ??
      "No direct standard Ranked change is recorded for this champion in 7.3b. Patch 7.3c is AAA ARAM-focused, so the current placement is driven by the reviewed Ranked snapshot and role context.",
    sourceIds: [
      "tencent-master",
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
    {
      label: "Best Blind Pick",
      championId: "malphite",
      reason: "S+ placement, strong Master+ results, and broad engage value keep the pick stable.",
    },
    {
      label: "Best Easy Climb Pick",
      championId: "darius",
      reason: "High current role presence and a straightforward punish-and-reset win condition.",
    },
    {
      label: "Highest Draft Priority",
      championId: "mordekaiser",
      reason: "S+ placement with substantial pick and ban pressure in the current snapshot.",
    },
    {
      label: "Biggest Riser",
      championId: "jayce",
      reason: "The reviewed Baron snapshot moved Jayce from C to A on October 19.",
    },
  ],
  jungle: [
    {
      label: "Best Blind Pick",
      championId: "jarvan-iv",
      reason: "Reliable gank setup and terrain control retain value without requiring a snowball.",
    },
    {
      label: "Best Easy Climb Pick",
      championId: "rammus",
      reason: "S+ placement and a 56.2% Master+ win rate give Rammus a strong current floor.",
    },
    {
      label: "Highest Draft Priority",
      championId: "nocturne",
      reason: "S+ placement and very high ban pressure remain significant after the 7.3b nerf.",
    },
    {
      label: "Biggest Riser",
      championId: "chogath",
      reason: "The reviewed Jungle snapshot moved Cho'Gath from B to S during patch 7.3.",
    },
  ],
  mid: [
    {
      label: "Best Blind Pick",
      championId: "orianna",
      reason:
        "S placement plus stable wave and teamfight value make her a flexible current option.",
    },
    {
      label: "Best Easy Climb Pick",
      championId: "brand",
      reason: "S+ placement and strong current results reward direct area-damage execution.",
    },
    {
      label: "Highest Draft Priority",
      championId: "hwei",
      reason: "S+ placement with 51.9% ban pressure keeps Hwei highly contested after 7.3b.",
    },
    {
      label: "Biggest Riser",
      championId: "malphite",
      reason: "Malphite moved from B to S in the reviewed Mid snapshot on October 27.",
    },
  ],
  dragon: [
    {
      label: "Best Blind Pick",
      championId: "ashe",
      reason: "S+ placement, range, and utility keep Ashe useful across many support pairings.",
    },
    {
      label: "Best Easy Climb Pick",
      championId: "jinx",
      reason:
        "A-tier placement and high role presence support a clear front-to-back win condition.",
    },
    {
      label: "Highest Draft Priority",
      championId: "smolder",
      reason: "S+ placement and strong current results give Smolder high carry priority.",
    },
    {
      label: "Biggest Riser",
      championId: "kalista",
      reason: "Kalista moved from B to S in the reviewed Dragon snapshot on October 25.",
    },
  ],
  support: [
    {
      label: "Best Blind Pick",
      championId: "braum",
      reason: "S+ placement and strong current results fit a wide range of team shapes.",
    },
    {
      label: "Best Easy Climb Pick",
      championId: "leona",
      reason: "S placement and a simple hard-engage pattern make fight starts easy to communicate.",
    },
    {
      label: "Highest Draft Priority",
      championId: "hwei",
      reason: "The current reviewed Support snapshot places Hwei S+ with high shared ban pressure.",
    },
    {
      label: "Biggest Riser",
      championId: "pyke",
      reason: "Current Support evidence keeps Pyke in A with meaningful roaming and pick value.",
    },
  ],
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
