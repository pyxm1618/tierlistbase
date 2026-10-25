import rawData from "../../../nikke-real-data.json";

export type ModeKey = "campaign" | "boss" | "pvp";
export type Rating = "SSS" | "SS" | "S" | "A" | "B" | "C" | "D";

export type Character = {
  slug: string;
  name: string;
  rarity: "SSR" | "SR" | "R";
  burst: string;
  cooldown: "20s" | "40s" | "60s";
  element: "Fire" | "Water" | "Wind" | "Iron" | "Electric";
  weapon: "AR" | "SMG" | "SG" | "SR" | "RL" | "MG";
  classType: "Attacker" | "Defender" | "Supporter";
  manufacturer: "Elysion" | "Missilis" | "Tetra" | "Pilgrim" | "Abnormal";
  availability: string;
  favoriteItem: boolean;
  ratings: Record<ModeKey, Rating>;
  newPlayer: string;
  investment: string;
  summary: string;
  strengths: string[];
  weaknesses: string[];
  whyThisTier: string | null;
  dependencies: string[];
  bestUse: string | null;
  corePartners: string[];
  alternatives: string[];
  skillInvestment: {
    recommended: string;
    budget: string;
    priorityOrder: string;
    notes: string | null;
  } | null;
  overloadGearPriority: string[];
  cubeRecommendation: string[];
};

export const characters: Character[] = rawData.characters.map((character) => ({
  slug: character.slug,
  name: character.name,
  rarity: character.rarity as Character["rarity"],
  burst: character.burstType,
  cooldown: character.burstCooldown as Character["cooldown"],
  element: character.element as Character["element"],
  weapon: character.weapon as Character["weapon"],
  classType: character.class as Character["classType"],
  manufacturer: character.manufacturer as Character["manufacturer"],
  availability: character.availability,
  favoriteItem: character.hasFavoriteItem,
  ratings: {
    campaign: character.campaignTier as Rating,
    boss: character.bossTier as Rating,
    pvp: character.pvpTier as Rating,
  },
  newPlayer: character.newPlayerValue,
  investment: character.investment,
  summary: character.summary,
  strengths: character.strengths,
  weaknesses: character.weaknesses,
  whyThisTier: character.whyThisTier,
  dependencies: character.dependencies,
  bestUse: character.bestUse,
  corePartners: character.corePartners,
  alternatives: character.alternatives,
  skillInvestment: character.skillInvestment,
  overloadGearPriority: character.overloadGearPriority,
  cubeRecommendation: character.cubeRecommendation,
}));

export const quickPicks = [
  {
    title: "Best Campaign Characters",
    names: rawData.quickPicks.bestCampaignCharacters,
    tone: "red",
  },
  {
    title: "Best Boss Characters",
    names: rawData.quickPicks.bestBossCharacters,
    tone: "purple",
  },
  {
    title: "Best PvP Characters",
    names: rawData.quickPicks.bestPvPCharacters,
    tone: "blue",
  },
  {
    title: "Best New Player Picks",
    names: rawData.quickPicks.bestNewPlayerPicks,
    tone: "green",
  },
  {
    title: "Best Reroll Targets",
    names: rawData.quickPicks.bestRerollTargets,
    tone: "orange",
  },
] as const;

export const recommendedTeams = rawData.recommendedTeams;
export const rerollTargets = rawData.reroll.rerollTargets;
export const wishlistData = rawData.wishlist;
export const currentBanner = rawData.currentBanners[0]!;
export const snapshot = rawData.snapshot;
export const sourceSummary = rawData.initialBaseline.sources;
