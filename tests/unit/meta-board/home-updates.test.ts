import fs from "node:fs";
import path from "node:path";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GameHome, prepareHomepageUpdates } from "@/components/home/game-home";
import { getGameContentFreshness } from "@/config/game-content-freshness.server";
import {
  buildRecentlyUpdatedCandidates,
  HOMEPAGE_GAME_FALLBACK_IMAGE,
  homepageRatingChangeGameSlugs,
  selectRecentlyUpdatedTierLists,
  type HomepageTierListCard,
} from "@/config/home-games.config";
import { getMultiGameRecentRatingChanges, type RecentRatingChangeItem } from "@/modules/meta-board";
import type { DatabaseClient } from "@/platform/database/client";

function update(
  id: string,
  gameSlug: string,
  changedAt: string,
  entityName = id,
): RecentRatingChangeItem {
  return {
    id,
    entityName,
    entitySlug: id,
    previousTier: "B",
    newTier: "A",
    changeType: "tier_movement",
    reason: `Reason for ${id}`,
    evidence: null,
    changedAt: new Date(changedAt),
    contextLabel: "Overall",
    toVersion: "test",
    gameSlug,
  };
}

function renderHome(
  updates: RecentRatingChangeItem[],
  featuredGames: readonly HomepageTierListCard[] = [],
): string {
  return renderToStaticMarkup(
    createElement(GameHome, {
      title: "Game Tier Lists",
      updates,
      featuredGames,
    }),
  );
}

describe("homepage multi-game updates", () => {
  it("derives the update query scope from all supported games instead of WoW/Genshin only", async () => {
    expect(homepageRatingChangeGameSlugs).toHaveLength(10);
    expect(homepageRatingChangeGameSlugs).toContain("wild-rift");
    expect(homepageRatingChangeGameSlugs).toContain("anime-expeditions");
    expect(homepageRatingChangeGameSlugs).toContain("slay-the-spire-2");

    const mockDb = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            innerJoin: () => ({
              innerJoin: () => ({
                innerJoin: () => ({
                  where: () => ({
                    orderBy: () => ({
                      limit: (n: number) =>
                        Promise.resolve([
                          update("wild-new", "wild-rift", "2026-11-09T10:00:00Z"),
                          update("phantom-next", "phantom-blade-zero", "2026-11-08T10:00:00Z"),
                        ]).then((items) => items.slice(0, n)),
                    }),
                  }),
                }),
              }),
            }),
          }),
        }),
      }),
    };

    const changes = await getMultiGameRecentRatingChanges(
      homepageRatingChangeGameSlugs,
      3,
      mockDb as unknown as DatabaseClient,
    );

    expect(changes.map((item) => item.gameSlug)).toEqual(["wild-rift", "phantom-blade-zero"]);
  });

  it("hides Latest Updates completely when there are 0 real changes", () => {
    const html = renderHome([]);

    expect(html).not.toContain('id="latest-updates"');
    expect(html).not.toContain("No update yet");
    expect(html).not.toContain("No update available");
    expect(html).not.toContain("New ranking changes will appear here when available.");
  });

  it("renders exactly 1 real update with the matching game metadata", () => {
    const html = renderHome([update("wild-1", "wild-rift", "2026-11-09T00:00:00Z", "Ahri")]);
    const cards = html.match(/<article class="tlb-update-card">[\s\S]*?<\/article>/g) ?? [];

    expect(cards).toHaveLength(1);
    expect(cards[0]).toContain("Wild Rift");
    expect(cards[0]).toContain("Ahri: B → A");
    expect(cards[0]).toContain('href="/wild-rift/tier-list"');
    expect(html).not.toContain("No update yet");
  });

  it("renders exactly 2 real updates without filling a third slot", () => {
    const html = renderHome([
      update("wild-1", "wild-rift", "2026-11-09T00:00:00Z"),
      update("phantom-1", "phantom-blade-zero", "2026-11-08T00:00:00Z"),
    ]);
    const cards = html.match(/<article class="tlb-update-card">[\s\S]*?<\/article>/g) ?? [];

    expect(cards).toHaveLength(2);
    expect(html).not.toContain("placeholder");
    expect(html).not.toContain("No update available");
  });

  it("sorts 3+ updates by changedAt descending and renders only the newest 3", () => {
    const updates = [
      update("oldest", "dragon-traveler", "2026-11-01T00:00:00Z"),
      update("newest", "wild-rift", "2026-11-10T00:00:00Z"),
      update("third", "anime-expeditions", "2026-11-08T00:00:00Z"),
      update("second", "phantom-blade-zero", "2026-11-09T00:00:00Z"),
    ];

    expect(prepareHomepageUpdates(updates).map((item) => item.id)).toEqual([
      "newest",
      "second",
      "third",
    ]);

    const html = renderHome(updates);
    const cards = html.match(/<article class="tlb-update-card">[\s\S]*?<\/article>/g) ?? [];

    expect(cards).toHaveLength(3);
    expect(html.indexOf("newest: B → A")).toBeLessThan(html.indexOf("second: B → A"));
    expect(html.indexOf("second: B → A")).toBeLessThan(html.indexOf("third: B → A"));
    expect(html).not.toContain("oldest: B → A");
  });
});

describe("homepage recently updated tier lists", () => {
  it("reads active-game freshness from canonical game sources and never copies dates into the adapter", async () => {
    const freshness = await getGameContentFreshness();
    const bySlug = new Map(freshness.map((item) => [item.slug, item.freshnessDate]));

    expect([...bySlug.keys()].sort()).toEqual(
      [
        "anime-expeditions",
        "dragon-traveler",
        "limbus-company",
        "phantom-blade-zero",
        "slay-the-spire-2",
        "wild-rift",
        "zenless-zone-zero",
      ].sort(),
    );
    for (const freshnessDate of bySlug.values()) {
      expect(freshnessDate).toMatch(/^20\d{2}-\d{2}-\d{2}$/);
    }
    expect(bySlug.has("wow-forever")).toBe(false);
    expect(bySlug.has("genshin-impact")).toBe(false);
    expect(bySlug.has("nikke")).toBe(false);

    const adapterSource = fs.readFileSync(
      path.resolve(process.cwd(), "src/config/game-content-freshness.server.ts"),
      "utf8",
    );
    expect(adapterSource).not.toMatch(/20\d{2}-\d{2}-\d{2}/);
  });

  it("automatically selects the 2 freshest eligible games and excludes archived snapshots", () => {
    const candidates = buildRecentlyUpdatedCandidates([
      { slug: "wow-forever", freshnessDate: "2026-11-12" },
      { slug: "anime-expeditions", freshnessDate: "2026-11-10" },
      { slug: "wild-rift", freshnessDate: "2026-11-09" },
      { slug: "phantom-blade-zero", freshnessDate: "2026-11-08" },
    ]);

    const selected = selectRecentlyUpdatedTierLists(candidates);

    expect(selected.map((game) => game.slug)).toEqual(["anime-expeditions", "wild-rift"]);
    expect(selected.some((game) => game.slug === "wow-forever")).toBe(false);
    expect(selected.map((game) => game.href)).toEqual([
      "/anime-expeditions/tier-list",
      "/wild-rift/tier-list",
    ]);
  });

  it("reorders automatically when freshness changes without changing the homepage component", () => {
    const first = selectRecentlyUpdatedTierLists(
      buildRecentlyUpdatedCandidates([
        { slug: "wild-rift", freshnessDate: "2026-11-09" },
        { slug: "phantom-blade-zero", freshnessDate: "2026-11-08" },
        { slug: "anime-expeditions", freshnessDate: "2026-11-07" },
      ]),
    );
    expect(first.map((game) => game.slug)).toEqual(["wild-rift", "phantom-blade-zero"]);

    const second = selectRecentlyUpdatedTierLists(
      buildRecentlyUpdatedCandidates([
        { slug: "wild-rift", freshnessDate: "2026-11-09" },
        { slug: "phantom-blade-zero", freshnessDate: "2026-11-10" },
        { slug: "anime-expeditions", freshnessDate: "2026-11-07" },
      ]),
    );
    expect(second.map((game) => game.slug)).toEqual(["phantom-blade-zero", "wild-rift"]);
  });

  it("uses the stable homepage fallback when an eligible game has no dedicated public hero image", () => {
    const [anime] = buildRecentlyUpdatedCandidates([
      { slug: "anime-expeditions", freshnessDate: "2026-11-10" },
    ]);

    expect(anime?.image).toBe(HOMEPAGE_GAME_FALLBACK_IMAGE);
    expect(anime?.imageSrcSet).toContain("/images/home/hero-768.webp");
  });

  it("renders Recently Updated Tier Lists from selected data rather than hardcoded game components", () => {
    const featured = selectRecentlyUpdatedTierLists(
      buildRecentlyUpdatedCandidates([
        { slug: "anime-expeditions", freshnessDate: "2026-11-10" },
        { slug: "wild-rift", freshnessDate: "2026-11-09" },
      ]),
    );
    const html = renderHome([], featured);

    expect(html).toContain("Recently Updated Tier Lists");
    expect(html).toContain('href="/anime-expeditions/tier-list"');
    expect(html).toContain('href="/wild-rift/tier-list"');
    expect(html).not.toContain("Featured Tier Lists");
  });
});
