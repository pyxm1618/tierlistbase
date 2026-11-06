import generated from "./data.generated.json";

export type CardTier = "S" | "A" | "B" | "C" | "D" | "Needs Review";
export type RelicTier = "S" | "A" | "B" | "C" | "D" | "E" | "F" | "G" | "Needs Review";
export type PotionTier = "S" | "A" | "B" | "C" | "D" | "F" | "Needs Review";
export type CardPool = "ironclad" | "silent" | "defect" | "necrobinder" | "regent" | "colorless";

export interface CardContext {
  readonly whenToPick: string;
  readonly whenToSkip: string;
  readonly bestWith: string;
}

export interface SlayCard {
  readonly id: string;
  readonly name: string;
  readonly pool: CardPool;
  readonly poolName: string;
  readonly type: string;
  readonly rarity: string;
  readonly cost: string | number | null;
  readonly description: string;
  readonly keywords: readonly string[];
  readonly image: string;
  readonly tier: CardTier;
  readonly sourceIds: readonly string[];
  readonly context: CardContext | null;
}

export interface SlayRelic {
  readonly id: string;
  readonly name: string;
  readonly rarity: string;
  readonly pool: string;
  readonly description: string;
  readonly image: string;
  readonly tier: RelicTier;
  readonly sourceIds: readonly string[];
}

export interface SlayCharacter {
  readonly id: string;
  readonly name: string;
  readonly rank: "Top" | "Middle" | "Last";
  readonly startingHp: number;
  readonly image: string;
  readonly strengths: string;
  readonly limitations: string;
  readonly playstyle: string;
  readonly sourceIds: readonly string[];
}

export interface SlayPotion {
  readonly id: string;
  readonly name: string;
  readonly rarity: string;
  readonly pool: string;
  readonly description: string;
  readonly image: string;
  readonly tier: PotionTier;
  readonly sourceIds: readonly string[];
}

export interface SlaySource {
  readonly id: string;
  readonly category: "Official" | "Game Data" | "Editorial Review" | "Community Data";
  readonly label: string;
  readonly url: string;
  readonly note: string;
}

interface Snapshot {
  readonly date: string;
  readonly mainVersion: string;
  readonly betaVersion: string;
  readonly releaseStatus: string;
  readonly lastReviewed: string;
  readonly rankingScope: string;
  readonly counts: {
    readonly rawCards: number;
    readonly cards: number;
    readonly rankedCards: number;
    readonly cardsNeedsReview: number;
    readonly relics: number;
    readonly rankedRelics: number;
    readonly relicsNeedsReview: number;
    readonly characters: number;
    readonly potions: number;
    readonly rankedPotions: number;
    readonly potionsNeedsReview: number;
  };
}

interface SlayData {
  readonly snapshot: Snapshot;
  readonly cards: readonly SlayCard[];
  readonly relics: readonly SlayRelic[];
  readonly characters: readonly SlayCharacter[];
  readonly potions: readonly SlayPotion[];
  readonly sources: readonly SlaySource[];
}

const data = generated as SlayData;

export const snapshot = data.snapshot;
export const cards = data.cards;
export const relics = data.relics;
export const characters = data.characters;
export const potions = data.potions;
export const sources = data.sources;

export const cardPools = [
  "ironclad",
  "silent",
  "defect",
  "necrobinder",
  "regent",
  "colorless",
] as const satisfies readonly CardPool[];

export const cardTierOrder = ["S", "A", "B", "C", "D", "Needs Review"] as const;
export const relicTierOrder = ["S", "A", "B", "C", "D", "E", "F", "G", "Needs Review"] as const;
export const potionTierOrder = ["S", "A", "B", "C", "D", "F", "Needs Review"] as const;

export const sourceById = new Map(sources.map((source) => [source.id, source]));

export function cardPoolName(pool: CardPool): string {
  return cards.find((card) => card.pool === pool)?.poolName ?? pool;
}

export function defaultCardForPool(pool: CardPool): SlayCard {
  const poolCards = cards.filter((card) => card.pool === pool);
  return (
    poolCards.find((card) => card.name === "Offering") ??
    poolCards.find((card) => card.tier === "S") ??
    poolCards[0]!
  );
}
