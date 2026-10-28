export const classKeys = ["Guardian", "Warrior", "Assassin", "Archer", "Mage", "Priest"] as const;

export type ClassKey = (typeof classKeys)[number];
export type ServerKey = "global" | "taiwan";
export type RankingMode = "overall" | "pve" | "pvp";
export type Tier = "S+" | "S" | "A" | "B" | "C";

export type TaxonomyOption<Key extends string = string> = Readonly<{
  key: Key;
  label: string;
}>;

export type Rankings = Readonly<Record<RankingMode, Tier>>;

export type Luminary<
  FactionKey extends string = string,
  RarityKey extends string = string,
> = Readonly<{
  id: string;
  name: string;
  classKey: ClassKey;
  factionKeys: readonly FactionKey[];
  rarityKey: RarityKey;
  rankings: Rankings;
  summary: string;
}>;

export type ServerSnapshot<
  FactionKey extends string = string,
  RarityKey extends string = string,
> = Readonly<{
  id: ServerKey;
  label: string;
  asOf: string;
  sourceLabel: string;
  coverageNote: string;
  factions: readonly TaxonomyOption<FactionKey>[];
  rarities: readonly TaxonomyOption<RarityKey>[];
  luminaries: readonly Luminary<FactionKey, RarityKey>[];
}>;

export type TeamRecommendation = Readonly<{
  server: ServerKey;
  mode: Exclude<RankingMode, "overall">;
  name: string;
  core: readonly string[];
  why: string;
  sourceLabel: string;
}>;

export type AccountDecision = Readonly<{
  server: ServerKey;
  type: "reroll" | "wishlist" | "pull";
  title: string;
  recommendation: string;
  rationale: string;
  sourceLabel: string;
}>;
