import { verifiedCharacters, type VerifiedCharacter } from "./data/verified-roster";
import ledger from "./data/research-ledger.json";
import { teamRecommendations } from "./data/teams";

export const classes = ["Guardian", "Warrior", "Assassin", "Archer", "Mage", "Priest"] as const;
export type ClassKey = (typeof classes)[number];
export const factions = [
  "Sanctum Glory",
  "Wild Spirit",
  "Elemental Echo",
  "Arcane Wisdom",
  "Otherworld Return",
  "Illusion Veil",
] as const;
export type FactionKey = (typeof factions)[number];
export const rarities = ["SSR EX", "SSR+", "SSR"] as const;
export type RarityKey = (typeof rarities)[number];
export const servers = ["global", "taiwan"] as const;
export type ServerKey = (typeof servers)[number];
export const tiers = ["S+", "S", "A", "B", "C"] as const;
export type Tier = (typeof tiers)[number];
export const rankingViews = ["Overall", "PvE", "PvP"] as const;
export type ViewKey = (typeof rankingViews)[number];
export const teamViews = ["PvE", "PvP"] as const;
export type TeamViewKey = (typeof teamViews)[number];
export type SourceRecord = {
  readonly id: string;
  readonly name: string;
  readonly url: string;
  readonly checkedAt: string;
  readonly sourceType: "official" | "community";
};
export type Luminary = {
  readonly id: string;
  readonly officialName: string;
  readonly displayName: string;
  readonly server: ServerKey;
  readonly class: ClassKey;
  readonly factions: readonly FactionKey[];
  readonly rarity: RarityKey;
  readonly viewTiers: Readonly<Record<ViewKey, Tier>>;
  readonly newPlayerValue: "High" | "Medium" | "Low";
  readonly investmentLevel: "Low" | "Medium" | "High" | "Whale";
  readonly teamDependency: "Independent" | "Flexible" | "Strict Synergy";
  readonly flexibility: "Universal" | "Broad" | "Niche";
  readonly whyThisTier: string;
  readonly strengths: readonly string[];
  readonly limitations: readonly string[];
  readonly bestFor: readonly string[];
  readonly bestPartners: readonly string[];
  readonly evidenceSourceIds: readonly string[];
};
export type UpcomingLuminary = {
  readonly id: string;
  readonly officialName: string;
  readonly displayName: string;
  readonly server: ServerKey;
  readonly class?: ClassKey;
  readonly factions?: readonly FactionKey[];
  readonly rarity?: RarityKey;
  readonly releaseStatus: "Upcoming";
  readonly releaseDate?: string;
  readonly evidenceSourceIds: readonly string[];
};
export type Team = {
  readonly id: string;
  readonly server: ServerKey;
  readonly view: TeamViewKey;
  readonly rank: number;
  readonly tier: Tier;
  readonly name: string;
  readonly archetype: string;
  readonly sourceFormationId: string;
  readonly investmentLevel: "Low" | "Medium" | "High";
  readonly members: readonly {
    readonly characterId: string;
    readonly role: string;
    readonly slot: "Left" | "Center" | "Right";
    readonly position: "Frontline" | "Midline" | "Backline";
  }[];
  readonly coreSynergy: string;
  readonly bestFor: readonly string[];
  readonly flexibleSlot?: string;
  readonly alternatives: readonly string[];
  readonly evidenceSourceIds: readonly string[];
};
export type RosterFilters = {
  readonly search?: string;
  readonly class?: string;
  readonly faction?: string;
  readonly rarity?: string;
};
export const snapshotDate = "2026-10-28";
export const upcomingLuminaries: readonly UpcomingLuminary[] = [];
export const researchLedger = ledger;
export const sourceRecords: readonly SourceRecord[] = [
  {
    id: "hideout-roster",
    name: "Hideout Guides — server rosters and Overall ordering",
    url: "https://www.hideoutgacha.com/games/dragon-traveler/tier-list",
    checkedAt: snapshotDate,
    sourceType: "community",
  },
  {
    id: "hideout-teams",
    name: "Hideout Guides — formations and substitutes",
    url: "https://www.hideoutgacha.com/games/dragon-traveler/team-compositions",
    checkedAt: snapshotDate,
    sourceType: "community",
  },
  {
    id: "allclash-arachne",
    name: "AllClash — Arachne Global banner assessment (October 25)",
    url: "https://www.allclash.com/best-characters-in-dragon-traveler-global-tier-list/",
    checkedAt: snapshotDate,
    sourceType: "community",
  },
  {
    id: "tw-classes",
    name: "Taiwan official — classes and factions (January 2025)",
    url: "https://sod.game-beans.com/jx/sodGuide/20250110/6568.html",
    checkedAt: snapshotDate,
    sourceType: "official",
  },
  ...verifiedCharacters.map((c) => ({
    id: `character-${c.id}`,
    name: `Hideout Guides — ${c.name} identity and character guide`,
    url: `https://www.hideoutgacha.com/games/dragon-traveler/characters/${c.id}`,
    checkedAt: snapshotDate,
    sourceType: "community" as const,
  })),
];
export const teams: readonly Team[] = teamRecommendations;
const gradeMap: Readonly<Record<string, Tier>> = {
  SS: "S+",
  "S+": "S",
  S: "A",
  "A+": "A",
  A: "B",
  "B/A": "B",
  "B+": "B",
  B: "B",
  C: "C",
};
export function normalizeSourceTier(raw: string, source: "hideout" | "allclash" = "hideout"): Tier {
  if (source === "allclash") {
    const tier = tiers.find((t) => t === raw);
    if (!tier) throw new Error(`Unknown AllClash source grade: ${raw}`);
    return tier;
  }
  const tier = gradeMap[raw];
  if (!Object.hasOwn(gradeMap, raw) || !tier)
    throw new Error(`Unknown Dragon Traveler source grade: ${raw}`);
  return tier;
}
const classLimitations: Readonly<Record<ClassKey, string>> = {
  Guardian:
    "Needs damage partners to finish stages; a durable frontline alone cannot clear a fight.",
  Warrior:
    "Frontline or midline positioning exposes this unit to pressure; pair with protection and recovery.",
  Assassin:
    "Enemy Guardians can intercept access to the backline; target selection and positioning matter.",
  Archer: "Benefits from backline placement; close-range enemy pressure can reduce damage output.",
  Mage: "Needs protection from divers and physical pressure while positioned in the middle or backline.",
  Priest:
    "Needs a protected position and a separate damage core; support alone does not finish the fight.",
};
function rankedCharacter(character: VerifiedCharacter, server: ServerKey): Luminary {
  const overall = character.serverOverall[server];
  if (!overall) throw new Error(`No ${server} live ranking for ${character.id}`);
  const roles = character.roles;
  const ratingSource = character.id === "arachne" ? "allclash" : "hideout";
  const affordable = ["fenrir", "oberonnie", "siegfried", "medusa", "chiron", "atanith"].includes(
    character.id,
  );
  const highDependency = /summon|Shield stacking|Punishment|Elemental Reaction/i.test(roles);
  return {
    id: character.id,
    officialName: character.name,
    displayName: character.name,
    server,
    class: character.class,
    factions: character.factions,
    rarity: character.rarity,
    viewTiers: {
      Overall: normalizeSourceTier(overall, ratingSource),
      PvE: normalizeSourceTier(character.sourceRatings.PvE, ratingSource),
      PvP: normalizeSourceTier(character.sourceRatings.PvP, ratingSource),
    },
    newPlayerValue: affordable ? "High" : character.rarity === "SSR EX" ? "Low" : "Medium",
    investmentLevel: affordable ? "Low" : character.rarity === "SSR EX" ? "Whale" : "High",
    teamDependency: highDependency ? "Strict Synergy" : "Flexible",
    flexibility: /Every team/.test(character.buildNote) ? "Broad" : "Niche",
    whyThisTier:
      character.id === "arachne"
        ? "Arachne contributes true damage and control to Punishment teams, but needs compatible partners. Overall, PvE and PvP retain AllClash’s October 25 S grades; this is an early guide assessment, not independent testing."
        : roles
          ? `${character.name} offers ${roles.toLowerCase()}. The ${server === "global" ? "Global" : "Taiwan"} Overall placement follows the server roster; PvE and PvP use the source character assessment, with five-band normalization.`
          : `${character.name} has published Overall, PvE and PvP assessments. Its placement follows those grades; a detailed kit review is not published, so treat investment as conditional.`,
    strengths: roles
      ? [`Role profile: ${roles}`, `Faction coverage: ${character.factions.join(" / ")}`]
      : [
          `Fills the ${character.class.toLowerCase()} slot`,
          `Contributes to ${character.factions.join(" / ")} formations`,
        ],
    limitations: [
      classLimitations[character.class],
      character.rarity === "SSR EX"
        ? "Premium duplicates raise the cost of reaching the recommended build."
        : "Star level and exclusive gear can change performance; a tier is not a guarantee.",
    ],
    bestFor: character.bestFor.length ? character.bestFor : ["PvE", "PvP"],
    bestPartners: character.partners
      .filter((id) =>
        verifiedCharacters.some(
          (c) => c.id === id && (c.servers as readonly ServerKey[]).includes(server),
        ),
      )
      .slice(0, 4),
    evidenceSourceIds:
      character.id === "arachne"
        ? ["allclash-arachne", "hideout-roster"]
        : [`character-${character.id}`, "hideout-roster"],
  };
}
const rosters: Readonly<Record<ServerKey, readonly Luminary[]>> = {
  global: verifiedCharacters
    .filter((c) => (c.servers as readonly ServerKey[]).includes("global"))
    .map((c) => rankedCharacter(c, "global")),
  taiwan: verifiedCharacters
    .filter((c) => (c.servers as readonly ServerKey[]).includes("taiwan"))
    .map((c) => rankedCharacter(c, "taiwan")),
};
export function getRoster(server: ServerKey): readonly Luminary[] {
  return rosters[server];
}
export function getFilters(server: ServerKey) {
  const roster = getRoster(server);
  return {
    factions: [...new Set(roster.flatMap((c) => c.factions))].sort(),
    rarities: [...new Set(roster.map((c) => c.rarity))].sort(),
  };
}
export function getQuickPicks(server: ServerKey) {
  return {
    "Best Overall": "poseidon",
    "Best PvE": server === "global" ? "poseidon" : "zeus",
    "Best PvP": server === "global" ? "atanith" : "lilith",
    "Best New Player": "fenrir",
    "Best Low-Investment": "medusa",
  } as const;
}
export function filterRoster(roster: readonly Luminary[], filters: RosterFilters) {
  const search = filters.search?.trim().toLocaleLowerCase() ?? "";
  return roster.filter(
    (c) =>
      (!search || c.displayName.toLocaleLowerCase().includes(search)) &&
      (!filters.class || c.class === filters.class) &&
      (!filters.faction || c.factions.some((f) => f === filters.faction)) &&
      (!filters.rarity || c.rarity === filters.rarity),
  );
}
