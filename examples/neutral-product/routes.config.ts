import { createRouteRegistry } from "@/platform/seo/route-registry";
import type { RouteDefinition } from "@/platform/seo/types";

import { seoConfig } from "./seo.config";

export const routeDefinitions = [
  {
    route: "/",
    class: "public_indexable",
    searchIntent: "discover evidence-based game meta boards and tier lists",
    primaryKeyword: "game meta board",
    secondaryKeywords: ["tier list base", "gaming tier list"],
    title: "TierListBase - Evidence-Based Game Meta Boards",
    description:
      "Evidence-based Game Meta Board and tier lists for World of Warcraft: Forever. Multi-source consensus, patch tracking, and transparent tier changes.",
    h1: "Evidence-based game meta boards for players",
    pageType: "WebApplication",
    relatedRoutes: ["/wow-forever/tier-list", "/privacy", "/terms"],
    lastModified: "2026-10-09",
    reviewStatus: "reviewed",
    reviewFingerprint: "f6dc74e630bd9df1edef45671f612084d05590752a335f2d3940d1a87d19acb3",
  },
  {
    route: "/wow-forever/tier-list",
    class: "public_indexable",
    searchIntent:
      "view World of Warcraft: Forever Level 30 Beta dungeon DPS, Tank and Healer specialization rankings with performance scores and linked evidence",
    primaryKeyword: "wow tier list",
    secondaryKeywords: ["wow forever tier list"],
    title: "WoW Tier List – WoW Forever Dungeon Spec Rankings",
    description:
      "Explore the WoW Forever Tier List for Level 30 beta dungeon DPS, tank and healer specializations, with performance scores, sample sizes and linked evidence.",
    h1: "WoW Tier List",
    pageType: "WebApplication",
    relatedRoutes: ["/", "/privacy", "/terms"],
    lastModified: "2026-10-16",
    reviewStatus: "reviewed",
    reviewFingerprint: "f7f699edb4c56724470e18d5415d3827d13b6bfe7df025a64181a0a1c4ce4f6e",
  },
  {
    route: "/genshin-impact/tier-list",
    class: "public_noindex",
    title: "Genshin Impact Tier List | TierListBase",
    description:
      "Genshin Impact tier list page on TierListBase. Verified rankings and evidence will appear here as reviewed data is published.",
  },
  {
    route: "/zenless-zone-zero/tier-list",
    class: "public_noindex",
    title: "Zenless Zone Zero Tier List | TierListBase",
    description:
      "Zenless Zone Zero agent rankings, team rankings, and account-focused pull advice.",
  },
  {
    route: "/limbus-company/tier-list",
    class: "public_noindex",
    title: "Limbus Company Tier List Preview | TierListBase",
    description:
      "Preview the TierListBase Limbus Company tier list interface for Identity, Team, E.G.O, and Sinner-focused recommendations.",
  },
  {
    route: "/about",
    class: "public_noindex",
    title: "About TierListBase",
    description:
      "Learn how TierListBase turns game data and evidence into clear, context-aware tier rankings for World of Warcraft: Forever and Genshin Impact.",
  },
  {
    route: "/privacy",
    class: "public_noindex",
    pageType: "Legal",
    title: "Privacy Notice",
    description: "Project-configured privacy notice.",
  },
  {
    route: "/terms",
    class: "public_noindex",
    pageType: "Legal",
    title: "Terms of Service",
    description: "Project-configured terms of service.",
  },
  {
    route: "/acceptable-use",
    class: "public_noindex",
    pageType: "Legal",
    title: "Acceptable Use Policy",
    description: "Project-configured acceptable use policy.",
  },
  {
    route: "/refund-policy",
    class: "public_noindex",
    pageType: "Legal",
    title: "Refund and Cancellation Policy",
    description: "Project-configured refund and cancellation policy.",
  },
  {
    route: "/contact",
    class: "public_noindex",
    pageType: "Legal",
    title: "Contact",
    description: "Project contact information.",
  },
  {
    route: "/account-deletion",
    class: "public_noindex",
    pageType: "Legal",
    title: "Account Deletion",
    description: "Account deletion instructions and lifecycle summary.",
  },
  { route: "/sign-in", class: "public_noindex" },
  { route: "/auth/magic-link/confirm", class: "public_noindex" },
  { route: "/account", class: "private" },
  { route: "/account/security", class: "private" },
  { route: "/account/billing", class: "private" },
  { route: "/account/credits", class: "private" },
  { route: "/account/deleted", class: "private" },
  { route: "/checkout/return", class: "private" },
  { route: "/robots.txt", class: "system" },
  { route: "/sitemap.xml", class: "system" },
  { route: "/api/auth", class: "system" },
  { route: "/api/auth/magic-link/request", class: "system" },
  { route: "/api/auth/magic-link/confirm", class: "system" },
  { route: "/api/account/delete", class: "system" },
  { route: "/api/commerce/checkout", class: "system" },
  { route: "/api/commerce/subscription/cancel", class: "system" },
  { route: "/api/commerce/subscription/resume", class: "system" },
  { route: "/api/commerce/refunds", class: "system" },
  { route: "/api/webhooks/waffo", class: "system" },
  { route: "/api/internal/jobs/account-deletion", class: "system" },
  { route: "/api/internal/jobs/commerce", class: "system" },
  { route: "/api/internal/jobs/credit-expiry", class: "system" },
  { route: "/api/internal/jobs/reconcile", class: "system" },
  { route: "/api/health/live", class: "system" },
  { route: "/api/health/ready", class: "system" },
  { route: "/api/test/emails/latest", class: "system" },
] as const satisfies readonly RouteDefinition[];

export const routeRegistry = createRouteRegistry(seoConfig, routeDefinitions);
