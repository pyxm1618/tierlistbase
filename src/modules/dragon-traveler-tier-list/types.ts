export const classKeys = ["Guardian", "Warrior", "Assassin", "Archer", "Mage", "Priest"] as const;

export const tierKeys = ["S+", "S", "A", "B", "C"] as const;
export const rankingViews = ["overall", "pve", "pvp"] as const;
export const serverKeys = ["global", "taiwan"] as const;

export type ClassKey = (typeof classKeys)[number];
export type TierKey = (typeof tierKeys)[number];
export type RankingView = (typeof rankingViews)[number];
export type ServerKey = (typeof serverKeys)[number];

export interface Luminary<FactionKey extends string, RarityKey extends string> {
  id: string;
  name: string;
  classKey: ClassKey;
  factions: readonly FactionKey[];
  rarity: RarityKey;
  tiers: Readonly<Record<RankingView, TierKey>>;
  note: string;
}

export interface QuickPick {
  label: string;
  luminaryId: string;
  rationale: string;
}

export interface ServerSnapshot<FactionKey extends string, RarityKey extends string> {
  server: ServerKey;
  label: string;
  snapshotDate: string;
  coverageNote: string;
  factionKeys: readonly FactionKey[];
  factionLabels: Readonly<Record<FactionKey, string>>;
  rarityKeys: readonly RarityKey[];
  luminaries: readonly Luminary<FactionKey, RarityKey>[];
  quickPicks: readonly QuickPick[];
}

export interface TeamRecommendation {
  id: string;
  server: ServerKey;
  mode: "pve" | "pvp";
  name: string;
  members: readonly string[];
  context: string;
  metric: string;
}

export interface AccountDecision {
  server: ServerKey;
  type: "reroll" | "wishlist" | "pull";
  title: string;
  priority: "High" | "Medium" | "Situational";
  targets: readonly string[];
  rationale: string;
  timing?: string;
}

export interface ChangeItem {
  server: ServerKey;
  date: string;
  title: string;
  detail: string;
}

export interface SourceRecord {
  id: string;
  label: string;
  url: string;
  server: ServerKey | "both";
  checkedAt: string;
  use: string;
}

export type AnyServerSnapshot = ServerSnapshot<string, string>;
