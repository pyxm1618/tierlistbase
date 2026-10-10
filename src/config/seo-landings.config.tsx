import type { LandingSection } from "@/components/landing/landing-page";

import { routeRegistry } from "./routes.config";

export type SeoLandingConfig = {
  readonly route: string;
  readonly sections: readonly LandingSection[];
};

const wowDef = routeRegistry.indexable().find((r) => r.route === "/wow-forever/tier-list");
const checklistDef = routeRegistry.indexable().find((r) => r.route === "/seo-starter-checklist");

export const seoLandingPages: readonly SeoLandingConfig[] = [
  ...(wowDef
    ? [
        {
          route: "/wow-forever/tier-list",
          sections: [
            {
              type: "hero" as const,
              enabled: true,
              order: 10,
              eyebrow: "World of Warcraft: Forever",
              h1: wowDef.h1,
              lead: "Evidence-backed tier list for World of Warcraft: Forever. Discover spec rankings across leveling, dungeons, and PvP with auditable source consensus.",
              primaryCta: { label: "Back to Homepage", href: "/" },
            },
            {
              type: "features" as const,
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
      ]
    : []),
  ...(checklistDef
    ? [
        {
          route: "/seo-starter-checklist",
          sections: [
            {
              type: "hero" as const,
              enabled: true,
              order: 10,
              eyebrow: "Reusable SEO landing template",
              h1: checklistDef.h1,
              lead: "Use this page as both a launch checklist and a reference implementation.",
              primaryCta: { label: "Start from the homepage", href: "/" },
            },
          ],
        },
      ]
    : []),
];

export function seoLandingForRoute(route: string): SeoLandingConfig | undefined {
  return seoLandingPages.find((page) => page.route === route);
}
