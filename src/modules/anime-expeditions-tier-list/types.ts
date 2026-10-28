export const unitViews = ["Overall", "DPS", "Utility", "Support", "Crowd Control"] as const;
export type UnitView = (typeof unitViews)[number];
export type UnitTier = "S+" | "S" | "A" | "B" | "C" | "Pending";
export type ItemTier = Exclude<UnitTier, "S+">;
export type Unit = {
  id: string;
  baseName: string;
  currentForm: string;
  forms: { name: string; evolved: boolean; sourceRevision: number }[];
  role: string;
  element: string;
  archetype: string;
  rarity: string;
  availability: string;
  availabilityNote: string;
  evolutionState: string;
  placementLimit: number | null;
  viewTiers: Record<UnitView, UnitTier>;
  why: string;
  reviewStatus: string;
  bestFor: string[];
  investment: string;
  investmentLevel: string;
  dependency: string;
  build: { traitIds: string[]; standardIds: string[]; exclusiveIds: string[]; note: string };
  partners: string[];
  hidden: boolean;
  asset: string;
  sourceIds: string[];
};
export type Trait = {
  id: string;
  name: string;
  effect: string;
  odds: string;
  pity: number | null;
  tier: ItemTier;
  bestFor: string;
  restriction: string;
  why: string;
  sourceIds: string[];
  status: string;
};
export type Equipment = {
  id: string;
  name: string;
  kind: "Standard" | "Exclusive";
  unit?: string;
  effect: string;
  passive: string;
  tier: ItemTier | null;
  bestFor: string;
  sourceIds: string[];
  asset: string;
  status: string;
};
export type Evolution = {
  unitId: string;
  from: string;
  to: string;
  priority: string | null;
  reason: string;
  unlock: string;
  materials: { name: string; count: number }[];
  status: string;
};
export type Team = {
  id: string;
  name: string;
  members: { unitId: string; role: string }[];
  investment: string;
  bestFor: string;
  weakness: string;
  replacements: string;
  dependency: string;
  status: string;
};
export type UnitFilters = Partial<
  Record<
    "search" | "role" | "element" | "archetype" | "rarity" | "availability" | "evolution" | "mode",
    string
  >
>;
