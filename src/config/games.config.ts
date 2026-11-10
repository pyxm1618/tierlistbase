export type GameTierListStatus = "active" | "archived";

export interface GameRegistryEntry {
  readonly slug: string;
  readonly name: string;
  readonly tierListHref: string;
  readonly navigationVisible: boolean;
  readonly navigationOrder: number;
  readonly tierListStatus: GameTierListStatus;
  readonly homepageImage?: string;
  readonly homepageTags: readonly string[];
}

export const gamesConfig: readonly GameRegistryEntry[] = [
  {
    slug: "wow-forever",
    name: "World of Warcraft",
    tierListHref: "/wow-forever/tier-list",
    navigationVisible: true,
    navigationOrder: 1,
    tierListStatus: "archived",
    homepageImage: "/images/home/wow.webp",
    homepageTags: ["Dungeons", "Level 30 Beta"],
  },
  {
    slug: "genshin-impact",
    name: "Genshin Impact",
    tierListHref: "/genshin-impact/tier-list",
    navigationVisible: true,
    navigationOrder: 2,
    tierListStatus: "archived",
    homepageImage: "/images/home/genshin.webp",
    homepageTags: ["Characters", "Version 7.1"],
  },
  {
    slug: "zenless-zone-zero",
    name: "Zenless Zone Zero",
    tierListHref: "/zenless-zone-zero/tier-list",
    navigationVisible: true,
    navigationOrder: 3,
    tierListStatus: "active",
    homepageTags: ["Characters", "Teams", "Builds"],
  },
  {
    slug: "nikke",
    name: "NIKKE",
    tierListHref: "/nikke/tier-list",
    navigationVisible: true,
    navigationOrder: 4,
    tierListStatus: "active",
    homepageTags: ["Characters", "v122.8 Snapshot"],
  },
  {
    slug: "limbus-company",
    name: "Limbus Company",
    tierListHref: "/limbus-company/tier-list",
    navigationVisible: true,
    navigationOrder: 5,
    tierListStatus: "active",
    homepageTags: ["Identities", "E.G.O", "Teams"],
  },
  {
    slug: "phantom-blade-zero",
    name: "Phantom Blade Zero",
    tierListHref: "/phantom-blade-zero/tier-list",
    navigationVisible: true,
    navigationOrder: 6,
    tierListStatus: "active",
    homepageImage: "/images/phantom-blade-zero/hero.webp",
    homepageTags: ["Weapons", "Phantom Edges", "Evidence"],
  },
  {
    slug: "dragon-traveler",
    name: "Dragon Traveler",
    tierListHref: "/dragon-traveler/tier-list",
    navigationVisible: true,
    navigationOrder: 7,
    tierListStatus: "active",
    homepageTags: ["Luminaries", "PvE", "PvP"],
  },
  {
    slug: "wild-rift",
    name: "Wild Rift",
    tierListHref: "/wild-rift/tier-list",
    navigationVisible: true,
    navigationOrder: 8,
    tierListStatus: "active",
    homepageImage: "/images/wild-rift/hero.webp",
    homepageTags: ["Ranked", "Roles", "Statistics"],
  },
  {
    slug: "anime-expeditions",
    name: "Anime Expeditions",
    tierListHref: "/anime-expeditions/tier-list",
    navigationVisible: true,
    navigationOrder: 9,
    tierListStatus: "active",
    homepageTags: ["Units", "Traits", "Equipment"],
  },
  {
    slug: "slay-the-spire-2",
    name: "Slay the Spire 2",
    tierListHref: "/slay-the-spire-2/tier-list",
    navigationVisible: true,
    navigationOrder: 10,
    tierListStatus: "active",
    homepageImage: "/images/slay-the-spire-2/hero-spire.svg",
    homepageTags: ["Cards", "Relics", "Characters"],
  },
] as const;

export const navigationGames = gamesConfig.filter((game) => game.navigationVisible);
