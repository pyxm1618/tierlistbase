import {
  identitiesMasterData,
  egoMasterData,
  teamsMasterData,
  sinnerBestIdentities,
  sinnerBestEgo,
} from "./data/index";
import type { AvailabilityFact, ReleaseContext } from "./data/types";

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
export type TierValue = "SSS" | "SS" | "S" | "A" | "B" | "C" | "NEEDS_REVIEW";
export type RatingValue = "A" | "B" | "C" | "High" | "Medium" | "Low";
export type Availability =
  | "Available"
  | "Extractable"
  | "Shardable"
  | "Seasonal"
  | "Walpurgisnacht"
  | "Pass"
  | "Temporarily Unavailable"
  | "Unavailable";
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
  rawDamageTypes: string[];
  rawSinAffinities: string[];
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

export function mapAvailability(
  fact: AvailabilityFact,
  releaseContext?: ReleaseContext,
  seasonNumber?: number | null,
): Availability {
  if (fact.temporarilyUnavailable) {
    return "Temporarily Unavailable";
  }
  if (fact.extractableNow && fact.dispensableNow) {
    return "Available";
  }
  if (fact.extractableNow && !fact.dispensableNow) {
    return "Extractable";
  }
  if (!fact.extractableNow && fact.dispensableNow) {
    return "Shardable";
  }
  if (!fact.extractableNow && !fact.dispensableNow) {
    if (fact.isWalpurgisnacht) {
      return "Walpurgisnacht";
    }
    if (releaseContext === "Pass" && seasonNumber === 8) {
      return "Pass";
    }
  }
  return "Unavailable";
}

const tierOrder: Record<TierValue, number> = {
  SSS: 1,
  SS: 2,
  S: 3,
  A: 4,
  B: 5,
  C: 6,
  NEEDS_REVIEW: 7,
};

export const identityRows: IdentityRow[] = [...identitiesMasterData]
  .sort((a, b) => tierOrder[a.editorial.overallTier] - tierOrder[b.editorial.overallTier])
  .map((item, index) => ({
    rank: index + 1,
    tier: item.editorial.overallTier,
    identity: item.fact.identityName,
    sinner: item.fact.sinner as SinnerName,
    rarity: item.fact.rarity,
    role: item.editorial.role,
    mainTeam: item.editorial.archetype,
    damageType: item.fact.damageTypes.join(" / "),
    sin: item.fact.sinAffinities.join(" / "),
    generalistValue: item.editorial.generalistValue,
    beginnerFriendly: item.editorial.beginnerFriendly,
    teamDependency: item.editorial.teamDependency,
    availability: mapAvailability(
      item.fact.availability,
      item.fact.releaseContext,
      item.fact.seasonNumber,
    ),
    rawDamageTypes: item.fact.damageTypes,
    rawSinAffinities: item.fact.sinAffinities,
  }));

export const bestIdentityBySinner: SinnerIdentityPick[] = sinnerBestIdentities.map((item) => ({
  sinner: item.sinner as SinnerName,
  bestOverall: item.bestOverall.name,
  bestGeneralist: item.bestGeneralist.name,
  bestForTeam: item.bestForTeam.name,
}));

export const teamRows: TeamRow[] = [...teamsMasterData]
  .sort((a, b) => tierOrder[a.powerTier] - tierOrder[b.powerTier])
  .map((team, index) => ({
    rank: index + 1,
    tier: team.powerTier,
    team: team.teamName,
    type: team.category,
    keyMechanic: team.keyMechanic,
    power: team.powerTier,
    storyGeneral: team.storyGeneral,
    mirrorDungeon: team.mirrorDungeon,
    railway: team.railwayEndgame,
    buildCost: team.buildCost,
    beginnerFriendly: team.beginnerFriendly,
  }));

const featuredTeam =
  teamsMasterData.find((team) => team.id === "status-bleed") ?? teamsMasterData[0]!;

export const exampleTeamDetail: TeamDetail = {
  team: featuredTeam.teamName,
  powerTier: featuredTeam.powerTier,
  storyGeneral: featuredTeam.storyGeneral,
  mirrorDungeon: featuredTeam.mirrorDungeon,
  railwayEndgame: featuredTeam.railwayEndgame,
  buildCost: featuredTeam.buildCost,
  coreDependency: featuredTeam.coreDependency,
  flexibility: featuredTeam.flexibility,
  easeOfUse: featuredTeam.easeOfUse,
  beginnerFriendly: featuredTeam.beginnerFriendly,
  coreMembers: [...featuredTeam.coreMembers],
  recommendedTeam: [...featuredTeam.recommendedTeam],
  substitutes: [...featuredTeam.substitutes],
  keyEgo: [...featuredTeam.keyEgo],
  missingOne: featuredTeam.whatToGetNext,
};

export const egoRows: EgoRow[] = [...egoMasterData]
  .sort((a, b) => tierOrder[a.editorial.tier] - tierOrder[b.editorial.tier])
  .map((item, index) => ({
    rank: index + 1,
    tier: item.editorial.tier,
    ego: item.fact.egoName,
    sinner: item.fact.sinner as SinnerName,
    mainTeam: item.editorial.bestTeam,
    bestUseCase: item.editorial.bestUseCase,
    generalist: item.editorial.generalist,
    teamImportance: item.editorial.teamImportance,
    availability: mapAvailability(
      item.fact.availability,
      item.fact.releaseContext,
      item.fact.seasonNumber,
    ),
  }));

export const bestEgoBySinner: SinnerEgoPick[] = sinnerBestEgo.map((item) => ({
  sinner: item.sinner as SinnerName,
  bestOverall: item.bestOverall.name,
  bestGeneralist: item.bestGeneralist.name,
  bestForTeam: item.bestForTeam.name,
}));
