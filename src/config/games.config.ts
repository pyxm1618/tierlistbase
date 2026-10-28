export interface GameRegistryEntry {
  slug: string;
  name: string;
  tierListHref: string;
  navigationVisible: boolean;
  navigationOrder: number;
}

export const gamesConfig: readonly GameRegistryEntry[] = [
  {
    slug: "wow-forever",
    name: "World of Warcraft",
    tierListHref: "/wow-forever/tier-list",
    navigationVisible: true,
    navigationOrder: 1,
  },
  {
    slug: "genshin-impact",
    name: "Genshin Impact",
    tierListHref: "/genshin-impact/tier-list",
    navigationVisible: true,
    navigationOrder: 2,
  },
  {
    slug: "zenless-zone-zero",
    name: "Zenless Zone Zero",
    tierListHref: "/zenless-zone-zero/tier-list",
    navigationVisible: true,
    navigationOrder: 3,
  },
  {
    slug: "nikke",
    name: "NIKKE",
    tierListHref: "/nikke/tier-list",
    navigationVisible: true,
    navigationOrder: 4,
  },
  {
    slug: "limbus-company",
    name: "Limbus Company",
    tierListHref: "/limbus-company/tier-list",
    navigationVisible: true,
    navigationOrder: 5,
  },
  {
    slug: "dragon-traveler",
    name: "Dragon Traveler",
    tierListHref: "/dragon-traveler/tier-list",
    navigationVisible: false,
    navigationOrder: 6,
  },
] as const;

export const navigationGames = gamesConfig.filter((game) => game.navigationVisible);
