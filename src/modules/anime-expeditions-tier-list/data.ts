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
  date: "2026-11-04",
  sourceFormCount: units.reduce((count, unit) => count + unit.forms.length, 0),
  releaseReady: false,
  version: { label: "Update 5 · Hallows Eve", status: "Current source reviewed" },
  teamSize: 6,
  uncertainties: [
    "The Update 5 ranking baseline is sourced from a November 2 current-patch tier list and cross-checked against current unit-kit pages. TierListBase role grades remain editorial synthesis, not publisher rankings.",
    "Exact current obtainment is not asserted for units whose current source does not document it. Limited status is shown only where the current source explicitly marks the unit Limited.",
    "Emerald Fist is verified as an Update 4 unit, but the current Update 5 ranking source does not place it; its comparative tier therefore remains Pending rather than inferred.",
    "Newly integrated Update 4 and Update 5 unit artwork is intentionally withheld until a provenance-approved local derivative is available. The UI uses an explicit placeholder instead of substituting incorrect art.",
    "Trait, equipment and evolution facts are source-reviewed where displayed; direct personal live testing of every interaction is not claimed.",
    "Weekly modifiers, banners and future balance changes are dynamic and can change practical value after this snapshot.",
  ],
} as const;
export const sources = [
  {
    id: "pgg-update5",
    name: "Pro Game Guides — Update 5 tier list and six-unit team cores",
    url: "https://progameguides.com/roblox/anime-expeditions-tier-list-best-units/",
    revision: null,
    checked: snapshot.date,
    note: "Updated November 2, 2026 for Hallows Eve (Update 5). Used as the current S–D comparative ranking baseline and for the documented six-unit team-core examples.",
  },
  {
    id: "current-wiki",
    name: "Anime Expeditions current unit database mirror",
    url: "https://animeexpedition.com/units",
    revision: null,
    checked: snapshot.date,
    note: "Current unit pages were used to close Update 4/5 canonical relationships, kits, placement limits, evolution materials and unit-bound equipment. Exact obtainment is not inferred when the source leaves it blank.",
  },
  {
    id: "mrguider-update5",
    name: "MrGuider — Update 5 role ranking cross-check",
    url: "https://www.mrguider.org/tier-list/anime-expeditions-tier-list/",
    revision: null,
    checked: snapshot.date,
    note: "November 1, 2026 Update 5 role lists used as a secondary cross-check for DPS, Utility, Support and Crowd Control classification of established units.",
  },
  {
    id: "update4-gameplay",
    name: "Update 4 in-game log in community gameplay",
    url: "https://www.youtube.com/watch?v=eSm0m9sb4gw&t=6s",
    revision: null,
    checked: snapshot.date,
    note: "At 00:06 the game log states Hollow Ascension / Update 4, six new Units and seven new Equipment. Emerald Fist is visible; the wiki equipment module is not a complete current inventory.",
  },
  {
    id: "sandbox-capacity",
    name: "Current Sandbox loadout observation",
    url: "https://www.youtube.com/watch?v=1t9G_jAOzGo&t=450s",
    revision: null,
    checked: snapshot.date,
    note: "At 07:30, Update 4 Hollow Desert Sandbox shows six occupied loadout slots. This does not verify normal-mode capacity, slot unlock rules or a team clear.",
  },
  {
    id: "official-hollow-trailer",
    name: "Official Hollow Ascension trailer",
    url: "https://www.youtube.com/watch?v=T1D37mxMiyw",
    revision: null,
    checked: snapshot.date,
    note: "Official Anime Expeditions channel; premiered October 25. Establishes update identity, not a complete roster or combat team capacity.",
  },
  {
    id: "hollow-calendar",
    name: "Hollow Ascension (4.0) event calendar",
    url: "https://animeexpeditions.miraheze.org/w/index.php?oldid=9649",
    revision: 9649,
    checked: snapshot.date,
    note: "Community revision October 27 identifies the 4.0 calendar. Equipment release pages 9614–9619 independently date six additions to October 27.",
  },
  {
    id: "draconic-patch",
    name: "Dated Update 3 Draconic patch cross-check",
    url: "https://allthings.how/anime-expeditions-endless-hellflame-update-every-new-unit-and-mode/",
    revision: null,
    checked: snapshot.date,
    note: "Independent September 25 report records DoT 50% → 120% and cost reduction 10% → 15%, explaining the older-source discrepancy. Community evidence, not an official game field.",
  },
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
    note: "17 documented effects, odds and pity values. Revision 9249 reflects the Update 3 Draconic buff; older descriptions predate that change.",
  },
  {
    id: "equipment-data",
    name: "Community wiki EquipmentData",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Module:EquipmentData/data&oldid=9612",
    revision: 9612,
    checked: snapshot.date,
    note: "22 Standard and 43 exclusive records; revised 2026-10-27. Individual release pages corroborate six Update 4 additions; comparative rankings remain under review.",
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
    note: "Two Standard slots plus an evolved unit-exclusive slot. Community documentation; individual media rights metadata is incomplete.",
  },
] as const;

export const teams: Team[] = [
  {
    id: "all-purpose",
    name: "All-Purpose Meta Core",
    members: [
      { unitId: "sovereign", role: "Carry" },
      { unitId: "lightning-god", role: "Carry" },
      { unitId: "5th-god-hand", role: "Control DPS" },
      { unitId: "broken-falcon", role: "Support" },
      { unitId: "kitsune", role: "Support" },
      { unitId: "puppet", role: "Crowd Control" },
    ],
    investment: "High",
    bestFor: "General Update 5 progression and broad wave coverage",
    weakness: "High-rarity ownership and upgrade costs make the exact core expensive to reproduce.",
    replacements: "Replace by role first: carry, amplification, then control. Do not treat lower-rarity ownership as a direct one-for-one performance claim.",
    dependency: "Six-unit core is source-backed for Update 5; exact traits and rolls remain account dependent.",
    status: "Source-reviewed Update 5",
  },
  {
    id: "anti-shield",
    name: "Anti-Shield / Burn Lockdown",
    members: [
      { unitId: "crow", role: "Carry" },
      { unitId: "head-captain", role: "Burn / Debuff" },
      { unitId: "ignition-commander", role: "Control DPS" },
      { unitId: "fallen-angel", role: "Crowd Control" },
      { unitId: "broken-falcon", role: "Support" },
      { unitId: "puppet", role: "Crowd Control" },
    ],
    investment: "High",
    bestFor: "Shielded waves and stages where Burn plus lockdown retain value",
    weakness: "Control resistance and modifier changes can reduce the value of the control-heavy slots.",
    replacements: "Preserve one carry, one support and at least two reliable control/debuff functions.",
    dependency: "Source-backed six-unit Update 5 core; practical ordering depends on stage resistances.",
    status: "Source-reviewed Update 5",
  },
  {
    id: "flame-dot",
    name: "Flame / DoT Core",
    members: [
      { unitId: "crimson-captain", role: "Carry" },
      { unitId: "metallic-alchemist", role: "Support" },
      { unitId: "wild-card", role: "Utility" },
      { unitId: "head-captain", role: "Burn / Debuff" },
      { unitId: "fallen-angel", role: "Crowd Control" },
      { unitId: "devil", role: "Flex DPS" },
    ],
    investment: "High",
    bestFor: "Fire and DoT-oriented stages",
    weakness: "DoT immunity, short stages and unfavorable modifiers can compress the payoff window.",
    replacements: "Keep the DoT enabler and amplification/control spine before adding another raw damage slot.",
    dependency: "Six-unit composition is assembled from the current Update 5 source's Flame/Fire DoT evaluation; exact rolls are not prescribed.",
    status: "Source-reviewed Update 5",
  },
  {
    id: "high-wave",
    name: "Infinite / High-Wave Core",
    members: [
      { unitId: "8th-sword", role: "Carry" },
      { unitId: "lightning-god", role: "Carry" },
      { unitId: "elf-mage", role: "Coverage" },
      { unitId: "5th-god-hand", role: "Control DPS" },
      { unitId: "ramen-guy", role: "Economy" },
      { unitId: "broken-falcon", role: "Support" },
    ],
    investment: "High",
    bestFor: "Long-run stages where ramp, economy and repeated control cycles matter",
    weakness: "Short stages may end before takedown, meter and economy mechanics repay their setup.",
    replacements: "Keep economy plus at least one scaling carry and one control/support slot.",
    dependency: "Source-backed Update 5 high-wave evaluation; wave length materially changes value.",
    status: "Source-reviewed Update 5",
  },
  {
    id: "lockdown",
    name: "Lockdown / Recovery Core",
    members: [
      { unitId: "5th-god-hand", role: "Distortion" },
      { unitId: "ignition-commander", role: "Stun / Control" },
      { unitId: "fallen-angel", role: "Crowd Control" },
      { unitId: "rainman", role: "Control DPS" },
      { unitId: "water-mage", role: "Control" },
      { unitId: "water-sage-founder", role: "Recovery / Utility" },
    ],
    investment: "High",
    bestFor: "Stages where layered control and recovery create safer damage windows",
    weakness: "Boss or stage immunity to control reduces several slots at once.",
    replacements: "Swap by control type and preserve a damage source that can capitalize on the recovered window.",
    dependency: "Six-unit composition follows the current Update 5 lockdown/recovery evaluation; immunity checks remain stage specific.",
    status: "Source-reviewed Update 5",
  },
];
export const auditCoverage = {
  total: units.length + traits.length + equipment.length + evolutions.length + teams.length,
  pass: units.filter((unit) => unit.reviewStatus.startsWith("Source-reviewed")).length,
  deferred:
    units.filter((unit) => !unit.reviewStatus.startsWith("Source-reviewed")).length +
    traits.length +
    equipment.length +
    evolutions.length +
    teams.length,
  rejected: 0,
  unknown: 0,
};
