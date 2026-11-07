import { routeRegistry } from "@/config/routes.config";

export const SEO_DENSITY_GAME_IDS = [
  "wow",
  "genshin",
  "zzz",
  "nikke",
  "limbus",
  "phantom-blade-zero",
  "dragon-traveler",
  "wild-rift",
  "anime-expeditions",
  "slay-the-spire-2",
] as const;

export type SeoDensityGameId = (typeof SEO_DENSITY_GAME_IDS)[number];

type GameSelectorConfig = {
  id: SeoDensityGameId;
  game: string;
  route: string;
  contentSelector: string;
};

const configs: readonly GameSelectorConfig[] = [
  {
    id: "wow",
    game: "WoW",
    route: "/wow-forever/tier-list",
    contentSelector: [
      "header[data-wow-hero] h1",
      "header[data-wow-hero] p",
      "header[data-wow-hero] dl",
      'section[aria-labelledby="wow-context-heading"] h2',
      'section[aria-labelledby="wow-context-heading"] > p',
      'section[aria-labelledby="wow-context-heading"] dl',
      'section[aria-labelledby="wow-context-heading"] nav a',
      'nav[aria-label="Class Navigator"] button',
      'section[aria-label="Tier Board"] header h2',
      'section[aria-label="Tier Board"] header > span',
      'section[aria-label="Tier Board"] div[class*="tierLabel"]',
      'section[aria-labelledby="wow-insights-heading"] h2',
      'section[aria-labelledby="wow-insights-heading"] > p',
      'section[aria-labelledby="wow-insights-heading"] article h3',
      'section[aria-labelledby="wow-changes-heading"] h2',
      'section[aria-labelledby="wow-changes-heading"] > p',
      'section[aria-labelledby="wow-sources-heading"] h2',
      'section[aria-labelledby="wow-sources-heading"] > p',
      'section[aria-labelledby="wow-sources-heading"] article strong',
      'section[aria-labelledby="wow-sources-heading"] article p',
      'section[aria-labelledby="wow-methodology-heading"] h2',
      'section[aria-labelledby="wow-methodology-heading"] > p',
      'section[aria-labelledby="wow-methodology-heading"] summary',
    ].join(","),
  },
  {
    id: "genshin",
    game: "Genshin Impact",
    route: "/genshin-impact/tier-list",
    contentSelector: [
      '[data-ia-section="page-header"] h1',
      '[data-ia-section="page-header"] p',
      '[data-ia-section="tier-board"] h2',
      '[data-ia-section="changes"] h2',
      '[data-ia-section="changes"] > p',
      '[data-ia-section="methodology"] h2',
      '[data-ia-section="methodology"] > p',
      '[data-ia-section="methodology"] li',
      '[data-ia-section="sources"] h2',
      '[data-ia-section="sources"] > p',
      '[data-ia-section="sources"] ol li',
      '[data-ia-section="tier-definitions"] h2',
      '[data-ia-section="tier-definitions"] > p',
      '[data-ia-section="tier-definitions"] dt',
      '[data-ia-section="tier-definitions"] dd',
      '[data-ia-section="faq"] h2',
      '[data-ia-section="faq"] summary',
    ].join(","),
  },
  {
    id: "zzz",
    game: "Zenless Zone Zero",
    route: "/zenless-zone-zero/tier-list",
    contentSelector: "main",
  },
  {
    id: "nikke",
    game: "NIKKE",
    route: "/nikke/tier-list",
    contentSelector: [
      'section[aria-label="NIKKE hero"] h1',
      'section[aria-label="NIKKE hero"] strong',
      'section[aria-label="NIKKE hero"] p',
      "#quick-picks h2",
      "#quick-picks p",
      "#quick-picks h3",
      "#tier-list h2",
      '#tier-list div[class*="sectionTitle"] p',
      "#teams h2",
      "#teams h3",
      "#reroll h2",
      "#reroll h3",
      "#wishlist h2",
      "#methodology h2",
      "#methodology > p",
      "#methodology li",
      "#changelog h2",
      "#changelog > p",
    ].join(","),
  },
  {
    id: "limbus",
    game: "Limbus Company",
    route: "/limbus-company/tier-list",
    contentSelector: [
      'section[aria-labelledby="limbus-title"] h1',
      'section[aria-labelledby="limbus-title"] p:not([aria-hidden="true"])',
      "#identity-tier-list > header h2",
      "#identity-tier-list > header p",
      "#best-identity-by-sinner > header h2",
      "#best-identity-by-sinner > header p",
      "#team-tier-list > header h2",
      "#team-tier-list > header p",
      "#ego-tier-list > header h2",
      "#ego-tier-list > header p",
      "#best-ego-by-sinner h2",
      'section[aria-labelledby="next-step-title"] h2',
      'section[aria-labelledby="next-step-title"] h3',
      'section[aria-labelledby="next-step-title"] p:not([aria-hidden="true"])',
    ].join(","),
  },
  {
    id: "phantom-blade-zero",
    game: "Phantom Blade Zero",
    route: "/phantom-blade-zero/tier-list",
    contentSelector: '[data-testid="pbz-page"]',
  },
  {
    id: "dragon-traveler",
    game: "Dragon Traveler",
    route: "/dragon-traveler/tier-list",
    contentSelector: "[data-dragon-traveler-page]",
  },
  {
    id: "wild-rift",
    game: "Wild Rift",
    route: "/wild-rift/tier-list",
    contentSelector: "main",
  },
  {
    id: "anime-expeditions",
    game: "Anime Expeditions",
    route: "/anime-expeditions/tier-list",
    contentSelector: "main",
  },
  {
    id: "slay-the-spire-2",
    game: "Slay the Spire 2",
    route: "/slay-the-spire-2/tier-list",
    contentSelector: "main",
  },
];

export type SeoDensityGameConfig = GameSelectorConfig & {
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  configurationWarnings: readonly string[];
};

export function getSeoDensityGameConfigs(): readonly SeoDensityGameConfig[] {
  return configs.map((config) => {
    const definition = routeRegistry.get(config.route);
    if (definition.class !== "public_indexable") {
      throw new Error(`${config.route} must be public_indexable for SEO density auditing`);
    }

    const warnings: string[] = [];
    const secondaryKeywords = definition.secondaryKeywords.filter((keyword, index, keywords) => {
      if (keyword === definition.primaryKeyword) {
        warnings.push(
          `${config.route}: secondaryKeywords duplicates primaryKeyword: "${keyword}"`,
        );
        return false;
      }
      if (keywords.indexOf(keyword) !== index) {
        warnings.push(`${config.route}: duplicate secondary keyword: "${keyword}"`);
        return false;
      }
      return true;
    });

    return {
      ...config,
      primaryKeyword: definition.primaryKeyword,
      secondaryKeywords,
      configurationWarnings: warnings,
    };
  });
}
