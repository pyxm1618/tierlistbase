import Link from "next/link";

import { SubscriptionOffer } from "@/components/commerce/subscription-offer";
import type { LandingSection } from "@/components/landing/landing-page";

import { featuresConfig } from "./features.config";
import { routeRegistry } from "./routes.config";

const homeRoute = routeRegistry.get("/");
if (homeRoute.class !== "public_indexable") throw new Error("home route must be indexable");

export const homeConfig = {
  sections: [
    {
      type: "hero",
      enabled: true,
      order: 10,
      eyebrow: "Evidence-Based Game Meta",
      h1: homeRoute.h1,
      lead: "TierListBase provides transparent, auditable game meta tier lists built from multi-source editorial consensus and verified telemetry rather than opaque formulas.",
      primaryCta: { label: "View WoW Forever Tier List", href: "/wow-forever/tier-list" },
    },
    {
      type: "tool-demo",
      enabled: true,
      order: 20,
      heading: "Currently live: World of Warcraft: Forever",
      body: "World of Warcraft: Forever is the first game board activated on TierListBase. Check out current patch rankings across leveling, dungeons, and PvP contexts.",
      surface: (
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-accent">
              Active Board
            </span>
            <h3 className="mt-1 text-xl font-bold text-foreground">World of Warcraft: Forever</h3>
            <p className="mt-1 text-sm text-muted">
              Live meta board tracking specs, roles, context rankings and verified patch changes.
            </p>
          </div>
          <Link
            href="/wow-forever/tier-list"
            className="inline-flex shrink-0 items-center justify-center rounded-lg bg-foreground px-5 py-2.5 text-sm font-semibold text-background transition hover:bg-foreground/90"
          >
            Open Meta Board →
          </Link>
        </div>
      ),
    },
    {
      type: "features",
      enabled: true,
      order: 30,
      heading: "Why TierListBase is different",
      items: [
        {
          title: "Multi-Source Consensus",
          body: "Rankings are aggregated across verified expert reviews with transparent disagreement and agreement ratios.",
        },
        {
          title: "Auditable Patch Changes",
          body: "Every tier shift is tracked against specific patch builds with documented evidence and reasons.",
        },
        {
          title: "Context-Aware Decisions",
          body: "Distinct rankings for Leveling, Dungeons, and PvP rather than a misleading generic list.",
        },
      ],
    },
    {
      type: "pricing",
      enabled: featuresConfig.commerce.subscriptions,
      order: 40,
      heading: "Platform monetization disabled",
      body: "Commercial capabilities remain disabled in neutral profile.",
      cards: [
        <SubscriptionOffer
          key="offer"
          productKey="test2-credits-monthly"
          headline="Monthly Credits"
          body="100 usage credits refreshed every month."
          priceLabel="$1.88 / month"
        />,
      ],
    },
  ] as readonly LandingSection[],
};
