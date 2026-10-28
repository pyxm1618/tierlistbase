import rawSnapshot from "./snapshot.json";
import type { Unit, Trait, Equipment, Evolution, Team } from "./types";

export { unitViews } from "./types";
export const units: Unit[] = rawSnapshot.units as Unit[];
export const traits: Trait[] = rawSnapshot.traits as Trait[];
export const equipment: Equipment[] = rawSnapshot.equipment as Equipment[];
export const evolutions: Evolution[] = rawSnapshot.evolutions;
import { getQuickPicks as deriveQuickPicks } from "./ranking";
export { unitTiers, filterUnits, tierFor } from "./ranking";
export function getQuickPicks() {
  return deriveQuickPicks(units);
}
export const modeContexts = [
  "All Modes",
  "Story / Challenge",
  "Raid",
  "Expeditions",
  "Infinite / Long-run",
  "Tournament",
] as const;
export const snapshot = {
  date: "2026-10-28",
  sourceFormCount: 105,
  releaseReady: false,
  version: { label: "3.5 unit snapshot · Update 4 equipment under review", status: "Needs Review" },
  teamSize: null,
  uncertainties: [
    "Official live version and current full roster are not confirmed. The latest unit module documents Update 3.5; newer equipment records include Update 4.",
    "All rankings and builds are provisional editorial assessments of documented mechanics, not verified current-patch live testing.",
    "Current obtainment, banner availability, team capacity and weekly modifiers need an in-game check.",
    "Draconic differs between the Traits page and older Trait Tome / mirrors. This snapshot uses Traits revision 9249 and retains the conflict for review.",
    "Suited Alchemist is a separately documented fusion ingredient, not an evolved form of Metallic Alchemist.",
    "Cube is marked Hidden in UnitData and retained in source coverage, excluded from the playable board. Broken Falcon's divergent forms share one canonical entity; Silver Falcon is the selected support path.",
  ],
} as const;
export const sources = [
  {
    id: "official",
    name: "Official Roblox experience",
    url: "https://www.roblox.com/games/84515722934860/Anime-Expeditions",
    revision: null,
    checked: snapshot.date,
    note: "Developer / game identity confirmed; public description has no numbered patch confirmation.",
  },
  {
    id: "unit-data",
    name: "Community wiki UnitData",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Module:UnitData/data&oldid=9555",
    revision: 9555,
    checked: snapshot.date,
    note: "105 form records; documented kits, evolution edges and identity fields. Last revised 2026-10-07.",
  },
  {
    id: "wiki-ranking",
    name: "Community role ranking",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Template:Tierlist&oldid=9561",
    revision: 9561,
    checked: snapshot.date,
    note: "Role-fit and build cross-check, revised 2026-10-08. Site grades are TierListBase editorial, not publisher grades.",
  },
  {
    id: "traits",
    name: "Community wiki Traits",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Traits&oldid=9249",
    revision: 9249,
    checked: snapshot.date,
    note: "17 effects and odds; conflicting older Draconic descriptions require live confirmation.",
  },
  {
    id: "equipment-data",
    name: "Community wiki EquipmentData",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Module:EquipmentData/data&oldid=9612",
    revision: 9612,
    checked: snapshot.date,
    note: "22 Standard and 43 exclusive records; revised 2026-10-27. Update 4 additions are Pending.",
  },
  {
    id: "mirror",
    name: "Independent database cross-check",
    url: "https://animeexpedition.com/",
    revision: null,
    checked: snapshot.date,
    note: "Older mirror; useful for identity cross-check only. Version, traits and rankings are stale relative to primary wiki revisions.",
  },
  {
    id: "equipment-rules",
    name: "Equipment slot rules",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Equipment&oldid=9613",
    revision: 9613,
    checked: snapshot.date,
    note: "Two Standard slots plus an evolved unit-exclusive slot. Wiki-derived factual data and media: contributors, CC BY-SA 4.0 where applicable.",
  },
] as const;

export const teams: Team[] = [
  {
    id: "general",
    name: "General Meta",
    members: [
      { unitId: "crimson-captain", role: "Carry" },
      { unitId: "broken-falcon", role: "Support" },
      { unitId: "fallen-angel", role: "Crowd Control" },
      { unitId: "ramen-guy", role: "Economy" },
      { unitId: "cubert", role: "Flex" },
    ],
    investment: "High",
    bestFor: "Mixed wave coverage",
    weakness: "Banner and kill-income ramp can be too slow for short stages.",
    replacements: "Stone Alchemist for early economy; Salmon Sorcerer for stall.",
    dependency: "Crimson Captain (Moon), role-fit DoT trait and evolved control form.",
    status: "Needs Review",
  },
  {
    id: "raid",
    name: "Boss / Raid",
    members: [
      { unitId: "sovereign", role: "Carry" },
      { unitId: "broken-falcon", role: "Support" },
      { unitId: "salmon-sorcerer", role: "Crowd Control" },
      { unitId: "stone-alchemist", role: "Economy" },
      { unitId: "subject-8", role: "Flex" },
    ],
    investment: "High",
    bestFor: "Bosses entering Djinn range",
    weakness: "Control-resistant bosses and limited upgrade windows change the plan.",
    replacements: "Cubert for a linked-carry support slot.",
    dependency: "Sovereign (Djinn); match the carry Archetype before adding a second damage unit.",
    status: "Needs Review",
  },
  {
    id: "long-run",
    name: "Long-run / Infinite",
    members: [
      { unitId: "crow", role: "Carry" },
      { unitId: "cubert", role: "Support" },
      { unitId: "fallen-angel", role: "Crowd Control" },
      { unitId: "ramen-guy", role: "Economy" },
      { unitId: "bioinsect", role: "Flex" },
    ],
    investment: "High",
    bestFor: "Enemy stacking and ramp",
    weakness: "Poor grouping loses Illusion value; transformations need takedowns.",
    replacements: "Salmon Sorcerer for accessible close-range stall.",
    dependency: "Evolved Crow and Illusion Crow; no assumption that control stacks without limits.",
    status: "Needs Review",
  },
  {
    id: "expedition",
    name: "Expeditions",
    members: [
      { unitId: "devil", role: "Carry" },
      { unitId: "metallic-alchemist", role: "Support" },
      { unitId: "fallen-angel", role: "Crowd Control" },
      { unitId: "ramen-guy", role: "Economy" },
      { unitId: "subject-8", role: "Flex" },
    ],
    investment: "High",
    bestFor: "Planning around temporary modifiers",
    weakness: "Modifier rolls and available upgrades can invalidate a fixed lineup.",
    replacements: "Cubert if the Alchemy team balance does not fit.",
    dependency: "DoT-capable evolved carry; re-evaluate Alchemy's equipped-team majority.",
    status: "Needs Review",
  },
  {
    id: "budget",
    name: "Budget / No Secret",
    members: [
      { unitId: "elf-mage", role: "Carry" },
      { unitId: "the-hero", role: "Support" },
      { unitId: "salmon-sorcerer", role: "Crowd Control" },
      { unitId: "stone-alchemist", role: "Economy" },
      { unitId: "water-princess", role: "Flex" },
    ],
    investment: "Moderate",
    bestFor: "Accounts without Secret units",
    weakness:
      "No Secret is not a promise of current easy availability; upgrades still cost resources.",
    replacements: "Use an owned control unit before chasing a rare replacement.",
    dependency:
      "Trait / equipment rolls and current obtainment must be checked; capacity is not confirmed.",
    status: "Needs Review",
  },
];
export const auditCoverage = {
  total: units.length + traits.length + equipment.length + evolutions.length + teams.length,
  pass: 0,
  deferred: units.length + traits.length + equipment.length + evolutions.length + teams.length,
  rejected: 0,
  unknown: 0,
};
