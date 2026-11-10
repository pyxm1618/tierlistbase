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
/**
 * Three dates are deliberately kept apart:
 * - `snapshot.date`      = evidence cutoff: the newest source revision actually reconciled.
 *                          It is the only date a "current" claim may rest on.
 * - `snapshot.reviewedAt` = the date the source-review pass was executed.
 * - route `lastModified`  = when the page itself really changed. It never proves
 *                          evidence freshness.
 */
export const carriedSourceCheck = "2026-11-05";
export const rereviewedSourceCheck = "2026-11-10";

export const snapshot = {
  date: "2026-11-08",
  reviewedAt: "2026-11-10",
  sourceFormCount: units.reduce((count, unit) => count + unit.forms.length, 0),
  releaseReady: true,
  version: { label: "Update 5 · Hallows Eve", status: "Current source reviewed" },
  teamSize: 6,
  uncertainties: [
    "Update 5 · Hallows Eve remains the latest named live major update found in the November 10 review. Roblox has received subsequent publishes/hotfixes, but no verified Update 6 release was found. The November 8 Pro Game Guides revision added Emerald Fist and refreshed Update 4 and 5 evaluation detail without moving any published tier.",
    "Unit grades are complete (77 of 77) but they are not equally evidenced. The Overall view matches the published tier list for 75 units and disagrees for none; Cube and Suited Alchemist are outside that source's ranked roster. The DPS, Utility, Support and Crowd Control sub-grades are TierListBase editorial for every unit because no source publishes graded role placements. Passing source review means the facts were checked, not that a publisher ranked the unit.",
    "Current obtainment is resolved for 72 of 77 canonical units. Reaper (Frenzied), Wolf (Revived), Black Heart (Revived), Noble Captain (Vibrant) and Traitor (Illusion) remain Needs Review because current UnitData omits obtainment and no sufficiently current second source proves a live route.",
    "All production-visible Unit portraits and required Equipment icons now have provenance-approved local WebP derivatives; file-level origins remain recorded beside the assets.",
    "Trait, Standard Equipment, Exclusive Equipment mapping and Evolution Priority records are source-reviewed; their tier / fit / investment grades are TierListBase editorial judgments rather than publisher rankings.",
    "Direct personal live testing of every interaction is not claimed. Weekly modifiers, banners and future balance changes can change practical value after this snapshot.",
  ],
} as const;
export const sources = [
  {
    id: "summer-obtainment",
    name: "Update 2 Summer / Tidal unit obtainment cross-check",
    url: "https://allthings.how/anime-expeditions-how-to-get-every-summer-siege-unit-in-update-2/",
    revision: null,
    checked: carriedSourceCheck,
    note: "Documents Summer Capsule routes for Head Captain, Rainman, Sand and Water Mage plus the Tidal Siege Sharkfang route. Used only with the current event-history source to decide whether those routes remain obtainable.",
  },
  {
    id: "current-event-history",
    name: "Current Anime Expeditions event history",
    url: "https://bloxodes.com/wiki/anime-expeditions",
    revision: null,
    checked: carriedSourceCheck,
    note: "Current event-history page checked November 5. It lists Update 2 Summer as completed and the game itself as updated November 4, so expired Summer / Tidal-only routes are not presented as currently obtainable without a replacement source.",
  },
  {
    id: "update3-obtainment",
    name: "Update 3 banner obtainment cross-check",
    url: "https://allthings.how/ignition-commander-betrayal-anime-expeditions-update-3-0-fire-unit-guide/",
    revision: null,
    checked: carriedSourceCheck,
    note: "Documents Ignition Commander on Standard / Mini Banner rotation. Used to close availability for that unit; rotation timing remains account/client dependent.",
  },
  {
    id: "pgg-update5",
    name: "Pro Game Guides — Update 5 tier list and six-unit team cores",
    url: "https://progameguides.com/roblox/anime-expeditions-tier-list-best-units/",
    revision: null,
    checked: rereviewedSourceCheck,
    note: "Re-read on November 10. The publisher's current revision is dated November 8, 2026 for Hallows Eve (Update 5): it added Emerald Fist and refreshed the Update 4/5 evaluation detail. Used as the current S–D comparative ranking baseline and for the documented six-unit team-core examples; every published unit tier was reconciled against it on that revision.",
  },
  {
    id: "current-wiki",
    name: "Anime Expeditions current unit database mirror",
    url: "https://animeexpedition.com/units",
    revision: null,
    checked: carriedSourceCheck,
    note: "Current unit pages were used to close Update 4/5 canonical relationships, kits, placement limits, evolution materials and unit-bound equipment. Exact obtainment is not inferred when the source leaves it blank.",
  },
  {
    id: "current-unit-role-crosscheck",
    name: "ExpeditionValues — current role / low-rarity stat cross-check",
    url: "https://expeditionvalues.com/tier-list",
    revision: null,
    checked: carriedSourceCheck,
    note: "Current November 5 cross-check used only to verify one low-rarity unit's carry role and bottom-end raw output. It supports that single record; it is not a roster-wide ranking. TierListBase retains its own S–D editorial scale rather than copying that site's grade scale.",
  },
  {
    id: "current-roster-obtainment",
    name: "Bloxron — November current-mode currency cross-check",
    url: "https://bloxron.com/anime-expeditions/codes",
    revision: null,
    checked: carriedSourceCheck,
    note: "Updated November 1, 2026. Confirms Infernal Dust is still farmed from District 7 rather than codes; used with the dedicated Crimson Captain acquisition guide, not as a standalone banner claim.",
  },
  {
    id: "crimson-captain-obtainment",
    name: "AllThingsHow — Crimson Captain acquisition route",
    url: "https://allthings.how/anime-expeditions-how-to-get-and-evolve-crimson-captain/",
    revision: null,
    checked: carriedSourceCheck,
    note: "Current fall 2026 acquisition guide documents District 7 Boss Rush Infernal Dust, the District 7 Secret Banner and the Moon evolution path. Cross-checked against the November 1 current-mode currency page before marking the route Available.",
  },
  {
    id: "mrguider-update5",
    name: "MrGuider — Update 5 role ranking cross-check",
    url: "https://www.mrguider.org/tier-list/anime-expeditions-tier-list/",
    revision: null,
    checked: rereviewedSourceCheck,
    note: "Re-read on November 10; the publisher page is still dated November 1, 2026 and still states that the five Update 5 units will be ranked soon. Used only as a page-level role cross-check for DPS, Utility, Support and Crowd Control classification — it is not attached as per-unit ranking evidence.",
  },
  {
    id: "update4-gameplay",
    name: "Update 4 in-game log in community gameplay",
    url: "https://www.youtube.com/watch?v=eSm0m9sb4gw&t=6s",
    revision: null,
    checked: carriedSourceCheck,
    note: "At 00:06 the game log states Hollow Ascension / Update 4, six new Units and seven new Equipment. Emerald Fist is visible; the wiki equipment module is not a complete current inventory.",
  },
  {
    id: "sandbox-capacity",
    name: "Current Sandbox loadout observation",
    url: "https://www.youtube.com/watch?v=1t9G_jAOzGo&t=450s",
    revision: null,
    checked: carriedSourceCheck,
    note: "At 07:30, Update 4 Hollow Desert Sandbox shows six occupied loadout slots. This does not verify normal-mode capacity, slot unlock rules or a team clear.",
  },
  {
    id: "official-hollow-trailer",
    name: "Official Hollow Ascension trailer",
    url: "https://www.youtube.com/watch?v=T1D37mxMiyw",
    revision: null,
    checked: carriedSourceCheck,
    note: "Official Anime Expeditions channel; premiered October 25. Establishes update identity, not a complete roster or combat team capacity.",
  },
  {
    id: "hollow-calendar",
    name: "Hollow Ascension (4.0) event calendar",
    url: "https://animeexpeditions.miraheze.org/w/index.php?oldid=9649",
    revision: 9649,
    checked: carriedSourceCheck,
    note: "Community revision October 27 identifies the 4.0 calendar. Equipment release pages 9614–9619 independently date six additions to October 27.",
  },
  {
    id: "draconic-patch",
    name: "Dated Update 3 Draconic patch cross-check",
    url: "https://allthings.how/anime-expeditions-endless-hellflame-update-every-new-unit-and-mode/",
    revision: null,
    checked: carriedSourceCheck,
    note: "Independent September 25 report records DoT 50% → 120% and cost reduction 10% → 15%, explaining the older-source discrepancy. Community evidence, not an official game field.",
  },
  {
    id: "official",
    name: "Official Roblox experience",
    url: "https://www.roblox.com/games/84515722934860/Anime-Expeditions",
    revision: null,
    checked: carriedSourceCheck,
    note: "Developer / game identity confirmed; public description has no numbered patch confirmation.",
  },
  {
    id: "unit-data",
    name: "Community wiki UnitData",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Module:UnitData/data&oldid=9555",
    revision: 9555,
    checked: carriedSourceCheck,
    note: "105 form records; documented kits, evolution edges and identity fields. Last revised 2026-10-07. This is a factual kit module and is never treated as ranking evidence.",
  },
  {
    id: "wiki-ranking",
    name: "Community role ranking",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Template:Tierlist&oldid=9561",
    revision: 9561,
    checked: carriedSourceCheck,
    note: "Role-fit and build cross-check, revised 2026-10-08. It predates Update 5 · Hallows Eve, so it corroborates a role read but cannot certify a current placement. Site grades are TierListBase editorial, not publisher grades.",
  },
  {
    id: "traits",
    name: "Community wiki Traits",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Traits&oldid=9249",
    revision: 9249,
    checked: carriedSourceCheck,
    note: "17 documented effects, odds and pity values. Revision 9249 reflects the Update 3 Draconic buff; older descriptions predate that change.",
  },
  {
    id: "equipment-data",
    name: "Community wiki EquipmentData",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Module:EquipmentData/data&oldid=9612",
    revision: 9612,
    checked: carriedSourceCheck,
    note: "22 Standard and 43 exclusive records; revised 2026-10-27. Individual release pages corroborate six Update 4 additions; comparative rankings remain under review.",
  },
  {
    id: "mirror",
    name: "Independent database cross-check",
    url: "https://animeexpedition.com/",
    revision: null,
    checked: carriedSourceCheck,
    note: "Older mirror; useful for identity cross-check only. Version, traits and rankings are stale relative to primary wiki revisions.",
  },
  {
    id: "equipment-rules",
    name: "Equipment slot rules",
    url: "https://animeexpeditions.miraheze.org/w/index.php?title=Equipment&oldid=9613",
    revision: 9613,
    checked: carriedSourceCheck,
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
    replacements:
      "Replace by role first: carry, amplification, then control. Do not treat lower-rarity ownership as a direct one-for-one performance claim.",
    dependency:
      "Six-unit core is source-backed for Update 5; exact traits and rolls remain account dependent.",
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
    weakness:
      "Control resistance and modifier changes can reduce the value of the control-heavy slots.",
    replacements:
      "Preserve one carry, one support and at least two reliable control/debuff functions.",
    dependency:
      "Source-backed six-unit Update 5 core; practical ordering depends on stage resistances.",
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
    weakness:
      "DoT immunity, short stages and unfavorable modifiers can compress the payoff window.",
    replacements:
      "Keep the DoT enabler and amplification/control spine before adding another raw damage slot.",
    dependency:
      "Six-unit composition is assembled from the current Update 5 source's Flame/Fire DoT evaluation; exact rolls are not prescribed.",
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
    weakness:
      "Short stages may end before takedown, meter and economy mechanics repay their setup.",
    replacements: "Keep economy plus at least one scaling carry and one control/support slot.",
    dependency:
      "Source-backed Update 5 high-wave evaluation; wave length materially changes value.",
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
    replacements:
      "Swap by control type and preserve a damage source that can capitalize on the recovered window.",
    dependency:
      "Six-unit composition follows the current Update 5 lockdown/recovery evaluation; immunity checks remain stage specific.",
    status: "Source-reviewed Update 5",
  },
];
const fullyReviewedUnits = units.filter(
  (unit) =>
    unit.availability !== "Needs Review" && !Object.values(unit.viewTiers).includes("Pending"),
).length;

export const auditCoverage = {
  total: units.length + traits.length + equipment.length + evolutions.length + teams.length,
  pass: fullyReviewedUnits + traits.length + equipment.length + evolutions.length + teams.length,
  deferred: units.length - fullyReviewedUnits,
  rejected: 0,
  unknown: 0,
};
