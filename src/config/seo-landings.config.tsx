import type { LandingSection } from "@/components/landing/landing-page";

import { routeRegistry } from "./routes.config";

export type SeoLandingConfig = {
  readonly route: string;
  readonly sections: readonly LandingSection[];
};

function indexableRoute(route: string) {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") {
    throw new Error(`${route} must be indexable`);
  }
  return definition;
}

const wowRoute = indexableRoute("/wow-forever/tier-list");

export const seoLandingPages = [
  {
    route: "/wow-forever/tier-list",
    sections: [
      {
        type: "hero",
        enabled: true,
        order: 10,
        eyebrow: "World of Warcraft: Forever",
        h1: wowRoute.h1,
        lead: "Evidence-backed tier list for World of Warcraft: Forever. Discover spec rankings across leveling, dungeons, and PvP with auditable source consensus.",
        primaryCta: { label: "Back to Homepage", href: "/" },
      },
      {
        type: "features",
        enabled: true,
        order: 20,
        heading: "Meta Methodology",
        items: [
          {
            title: "Expert Consensus",
            body: "Normalized across verified editorial and expert tiers without black-box ML.",
          },
          {
            title: "Strict Patch Isolation",
            body: "Each ranking is anchored to an explicit patch and build number to prevent stale data bleed.",
          },
          {
            title: "Transparent Disagreement",
            body: "We display when sources disagree so you understand where the meta is still in flux.",
          },
        ],
      },
    ],
  },
] as const satisfies readonly SeoLandingConfig[];

export function seoLandingForRoute(route: string): SeoLandingConfig | undefined {
  return seoLandingPages.find((page) => page.route === route);
}
