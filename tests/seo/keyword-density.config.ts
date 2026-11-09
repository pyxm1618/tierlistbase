import { routeRegistry } from "@/config/routes.config";

import type { KeywordDensityResult } from "./keyword-density";

export const SEO_DENSITY_TARGET_IDS = [
  "home",
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

export type SeoDensityTargetId = (typeof SEO_DENSITY_TARGET_IDS)[number];
export type SeoDensityMode = "report" | "enforce";

type AdditionalMeasurementView = {
  activateSelector: string;
  contentSelector: string;
  description: string;
};

type TargetSelectorConfig = {
  id: SeoDensityTargetId;
  label: string;
  route: string;
  contentSelector: string;
  scopeDescription: string;
  additionalViews?: readonly AdditionalMeasurementView[];
};

const configs: readonly TargetSelectorConfig[] = [
  {
    id: "home",
    label: "Homepage",
    route: "/",
    contentSelector: [
      ".tlb-hero h1",
      ".tlb-hero-inner > p",
      "#explore .tlb-section-heading h2",
      "#explore .tlb-section-heading p",
      "#why-tierlistbase .tlb-section-heading h2",
      "#why-tierlistbase .tlb-section-heading p",
      "#why-tierlistbase .tlb-benefit h3",
      "#why-tierlistbase .tlb-benefit p",
      "#latest-updates .tlb-section-heading h2",
      "#latest-updates .tlb-section-heading p",
      "#popular-rankings .tlb-section-heading h2",
      "#popular-rankings .tlb-section-heading p",
    ].join(","),
    scopeDescription:
      "Stable homepage SEO editorial copy: Hero, Explore/Why/Latest/Popular headings and intros, plus fixed benefit headings/descriptions; excludes game cards, dynamic Latest Updates entities/dates/reasons, Popular Rankings entity items, tags, links/buttons/controls, navigation, and Coming Soon UI.",
  },
  {
    id: "wow",
    label: "WoW",
    route: "/wow-forever/tier-list",
    contentSelector: [
      "header[data-wow-hero] h1",
      "header[data-wow-hero] p",
      'section[aria-labelledby="wow-context-heading"] h2',
      'section[aria-labelledby="wow-context-heading"] > p',
      'section[aria-labelledby="wow-insights-heading"] h2',
      'section[aria-labelledby="wow-insights-heading"] > p',
      'section[aria-labelledby="wow-insights-heading"] article h3',
      'section[aria-labelledby="wow-insights-heading"] article p',
      'section[aria-labelledby="wow-changes-heading"] h2',
      'section[aria-labelledby="wow-changes-heading"] > p',
      'section[aria-labelledby="wow-sources-heading"] h2',
      'section[aria-labelledby="wow-sources-heading"] > p',
      'section[aria-labelledby="wow-sources-heading"] article h3',
      'section[aria-labelledby="wow-sources-heading"] article p',
      'section[aria-labelledby="wow-methodology-heading"] h2',
      'section[aria-labelledby="wow-methodology-heading"] > p',
      'section[aria-labelledby="wow-methodology-heading"] summary',
    ].join(","),
    scopeDescription:
      "Hero and ranking-context editorial copy plus Quick Insights, What Changed, Sources, and Methodology/FAQ headings and explanations; excludes class navigation controls, tier-board entities, spec details, and snapshot fact values.",
  },
  {
    id: "genshin",
    label: "Genshin Impact",
    route: "/genshin-impact/tier-list",
    contentSelector: [
      '[data-ia-section="page-header"] h1',
      '[data-ia-section="page-header"] p',
      '[data-ia-section="tier-board"] h2',
      '[data-ia-section="changes"] h2',
      '[data-ia-section="methodology"] h2',
      '[data-ia-section="methodology"] > p',
      '[data-ia-section="methodology"] li',
      '[data-ia-section="sources"] h2',
      '[data-ia-section="sources"] > p',
      '[data-ia-section="tier-definitions"] h2',
      '[data-ia-section="tier-definitions"] > p',
      '[data-ia-section="tier-definitions"] dt',
      '[data-ia-section="tier-definitions"] dd',
      '[data-ia-section="faq"] h2',
      '[data-ia-section="faq"] summary',
    ].join(","),
    scopeDescription:
      "Hero intro, tier-board heading, and stable What Changed, Methodology, Sources, tier-definition, and FAQ editorial copy; excludes search/filter controls, character cards, character detail, ranking-context facts, and change entity lists.",
  },
  {
    id: "zzz",
    label: "Zenless Zone Zero",
    route: "/zenless-zone-zero/tier-list",
    contentSelector: [
      "main > section:first-of-type div:has(> h1)",
      'section[aria-label="Agent Ranking"] div:has(> h2)',
    ].join(","),
    scopeDescription:
      "Frozen static editorial inventory: Hero intro plus Agents and Teams section heading/intro copy; excludes Current Pull Advice, filters/tabs, agent/team entities, detail overlays, and all business data.",
    additionalViews: [
      {
        activateSelector:
          'nav[aria-label="Tier list primary sections"] [role="tab"]:has-text("Teams")',
        contentSelector: 'section[aria-label="Team Ranking"] div:has(> h2)',
        description: "Teams static editorial heading and intro after activating the Teams view.",
      },
    ],
  },
  {
    id: "nikke",
    label: "NIKKE",
    route: "/nikke/tier-list",
    contentSelector: [
      'section[aria-label="NIKKE hero"] h1',
      'section[aria-label="NIKKE hero"] strong',
      'section[aria-label="NIKKE hero"] p',
      "#quick-picks h2",
      "#quick-picks > div:first-child p",
      "#tier-list h2",
      '#tier-list > div:first-child div[class*="sectionTitle"] p',
      "#teams h2",
      "#reroll h2",
      "#reroll h3",
      "#wishlist h2",
      "#methodology h2",
      "#methodology > p",
      "#methodology li",
      "#changelog h2",
      "#changelog > p",
    ].join(","),
    scopeDescription:
      "Hero, section headings/intros, reroll/wishlist framing, methodology explanations, and changelog intro; excludes character lists/details, team compositions, investment data, filters/tabs, wishlist entities, and current banner advice.",
  },
  {
    id: "limbus",
    label: "Limbus Company",
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
    scopeDescription:
      "Hero plus stable ranking-section questions/descriptions and next-step guidance; excludes Identity/E.G.O/team entity cards, selected detail content, controls, numeric ratings, and aria-hidden graffiti.",
  },
  {
    id: "phantom-blade-zero",
    label: "Phantom Blade Zero",
    route: "/phantom-blade-zero/tier-list",
    contentSelector: [
      '[data-testid="pbz-page"] > header h1',
      '[data-testid="pbz-page"] > header div:has(> h1) > p',
      'section[aria-labelledby="quick-picks-title"] h2',
      'section[aria-labelledby="quick-picks-title"] > p',
      'section[aria-labelledby="ranking-workspace-title"] h2',
      'section[aria-labelledby="ranking-workspace-title"] > p',
      'section[aria-labelledby="methodology-title"] h2',
      'section[aria-labelledby="methodology-title"] p',
      'section[aria-labelledby="sources-title"] h2',
      'section[aria-labelledby="sources-title"] > p',
      'section[aria-labelledby="changes-title"] h2',
      'section[aria-labelledby="changes-title"] p',
      'section[aria-labelledby="faq-title"] h2',
      'section[aria-labelledby="faq-title"] summary',
    ].join(","),
    scopeDescription:
      "Hero and coverage copy plus Quick Picks/Ranking Workspace intros, Methodology, Sources explanatory copy, What Changed, and FAQ questions; excludes weapon/Phantom Edge entities, tier board, search/filter controls, entity detail, source lists, and release counters.",
  },
  {
    // Round 3C: the frozen group is resolved from routeRegistry and has exactly three
    // secondaries. "dragon traveler taiwan tier list" is a rejected low-volume word-order
    // variant of the Taiwan intent, not a separate density target.
    id: "dragon-traveler",
    label: "Dragon Traveler",
    route: "/dragon-traveler/tier-list",
    contentSelector: [
      'section[aria-labelledby="dragon-title"] h1',
      'section[aria-labelledby="dragon-title"] h1 + p',
      'section[aria-labelledby="quick-picks-title"] h2',
      'section[aria-labelledby="quick-picks-title"] div:has(> h2) > p',
      'section[aria-label="Luminary rankings and details"] div:has(> h2) > h2',
      'section[aria-label="Luminary rankings and details"] div:has(> h2) > p',
      'section[aria-labelledby="teams-title"] h2',
      'section[aria-labelledby="teams-title"] div:has(> h2) > p',
      'section[aria-labelledby="teams-title"] > p',
      'section[aria-labelledby="decisions-title"] > h2',
      'section[aria-labelledby="decisions-title"] > p',
      'section:has(> h2:text-is("What Changed")) > h2',
      'section:has(> h2:text-is("What Changed")) > p',
      'section[aria-labelledby="methodology-title"] h2',
      'section[aria-labelledby="methodology-title"] h3',
      'section[aria-labelledby="methodology-title"] p',
      'section[aria-labelledby="methodology-title"] summary',
      'section:has(> h2:text-is("Sources")) > h2',
      'section:has(> h2:text-is("Sources")) > p',
      'section:has(> h2:text-is("FAQ")) > h2',
      'section:has(> h2:text-is("FAQ")) summary',
    ].join(","),
    scopeDescription:
      "Hero plus Quick Picks, ranking, teams, account-decision intros, What Changed, Methodology, Sources explanations, and FAQ questions; excludes Luminary cards/details, formation members, tabs/filters, wishlist/reroll entities, Current Pull Priority, and live account data.",
  },
  {
    id: "wild-rift",
    label: "Wild Rift",
    route: "/wild-rift/tier-list",
    contentSelector: [
      '[data-ia-section="hero"] h1',
      '[data-ia-section="hero"] h1 ~ p',
      '[data-ia-section="sources-evidence"] h2',
      '[data-ia-section="sources-evidence"] > div:first-child > p',
      '[data-ia-section="sources-evidence"] > p',
      '[data-ia-section="methodology"] h2',
      '[data-ia-section="methodology"] > div:first-child > p',
      '[data-ia-section="methodology"] > p',
      '[data-ia-section="methodology"] article h3',
      '[data-ia-section="methodology"] article li',
      '[data-ia-section="methodology"] dt',
      '[data-ia-section="methodology"] dd',
      '[data-ia-section="faq"] h2',
      '[data-ia-section="faq"] > div:first-child > p',
      '[data-ia-section="faq"] summary',
    ].join(","),
    scopeDescription:
      "Hero plus Sources, Methodology, role criteria, tier definitions, and FAQ editorial copy; excludes champion workspace/overview entities, statistics, role controls, champion detail, source cards, and freshness counters.",
  },
  {
    id: "anime-expeditions",
    label: "Anime Expeditions",
    route: "/anime-expeditions/tier-list",
    contentSelector: [
      'section[aria-labelledby="ae-title"] h1',
      'section[aria-labelledby="ae-title"] h1 + p',
      "#traits > div:first-child h2",
      "#traits > div:first-child p",
      "#traits > p",
      "#equipment > div:first-child h2",
      "#equipment > div:first-child p",
      "#equipment > h3",
      "#equipment > p",
      "#teams > div:first-child h2",
      "#teams > div:first-child p",
      "#teams > p",
      "#evolution > div:first-child h2",
      "#evolution > div:first-child p",
      "#evolution > p",
      "#changes > h2",
      "#changes > p",
      "#changes > div h3",
      "#changes > div p",
      "#sources > h2",
      "#sources > p",
      "#sources > details > summary",
      "#methodology > h2",
      "#methodology > p",
      "#methodology dt",
      "#methodology dd",
      "#faq > h2",
      "#faq summary",
    ].join(","),
    scopeDescription:
      "Hero and stable Traits/Equipment/Teams/Evolution intros plus What Changed, Sources explanatory copy, Methodology, and FAQ questions; excludes unit workspace, trait/equipment entities, recommendations, team members, evolution recipes, source lists, and detail dialogs.",
  },
  {
    id: "slay-the-spire-2",
    label: "Slay the Spire 2",
    route: "/slay-the-spire-2/tier-list",
    contentSelector: [
      '[data-ia-section="hero"] h1',
      '[data-ia-section="hero"] h1 + p',
      'section[aria-label="Ranking Context"] > strong',
      'section[aria-label="Ranking Context"] > p',
      'section[aria-labelledby="cards-title"] h2',
      'section[aria-labelledby="cards-title"] p',
      '[data-ia-section="what-changed"] h2',
      '[data-ia-section="what-changed"] article strong',
      '[data-ia-section="what-changed"] article p',
      '[data-ia-section="methodology"] h2',
      '[data-ia-section="methodology"] li',
      '[data-ia-section="sources-evidence"] h2',
      '[data-ia-section="sources-evidence"] > p',
      '[data-ia-section="faq"] h2',
      '[data-ia-section="faq"] summary',
    ].join(","),
    scopeDescription:
      "Hero, ranking-context and Cards intro plus What Changed, Methodology, Sources disclaimer, and FAQ questions; excludes card/relic/character/potion entity boards, filters/tabs, quick-insight live signals, detail panel, and source-card listings.",
  },
];

export type SeoDensityTargetConfig = TargetSelectorConfig & {
  primaryKeyword: string;
  secondaryKeywords: readonly string[];
  configurationWarnings: readonly string[];
};

export function parseSeoDensityMode(raw = process.env.SEO_DENSITY_MODE): SeoDensityMode {
  if (!raw || raw === "enforce") return "enforce";
  if (raw === "report") return "report";
  throw new Error(`Unknown SEO_DENSITY_MODE: ${raw}`);
}

export function assertSeoDensityResult(
  result: KeywordDensityResult,
  mode: SeoDensityMode,
  label: string,
): void {
  if (mode === "report") return;
  if (!result.primaryDominance) {
    throw new Error(`${label}: primary occurrences must exceed every secondary keyword`);
  }
  if (!result.densityGate) {
    throw new Error(`${label}: keyword-group density must be between 3% and 5%`);
  }
}

export function getSeoDensityTargetConfigs(): readonly SeoDensityTargetConfig[] {
  return configs.map((config) => {
    const definition = routeRegistry.get(config.route);
    if (definition.class !== "public_indexable") {
      throw new Error(`${config.route} must be public_indexable for SEO density auditing`);
    }

    const warnings: string[] = [];
    const registrySecondaryKeywords = definition.secondaryKeywords ?? [];
    const secondaryKeywords = registrySecondaryKeywords.filter((keyword, index, keywords) => {
      if (keyword === definition.primaryKeyword) {
        warnings.push(`${config.route}: secondaryKeywords duplicates primaryKeyword: "${keyword}"`);
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
