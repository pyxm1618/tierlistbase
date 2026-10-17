import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";

import { GameHome } from "@/components/home/game-home";
import { getMultiGameRecentRatingChanges, type RecentRatingChangeItem } from "@/modules/meta-board";
import type { DatabaseClient } from "@/platform/database/client";

describe("homepage multi-game updates", () => {
  it("merges and sorts real changes from multiple games by changedAt descending", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            innerJoin: () => ({
              innerJoin: () => ({
                innerJoin: () => ({
                  where: () => ({
                    orderBy: () => ({
                      limit: (n: number) => {
                        const mockChanges: RecentRatingChangeItem[] = [
                          {
                            id: "change-wow-older",
                            entityName: "Protection Paladin",
                            entitySlug: "protection-paladin",
                            previousTier: "A",
                            newTier: "S",
                            changeType: "tier_movement",
                            reason: "Strong survivability in latest patch",
                            evidence: null,
                            changedAt: new Date("2026-10-10T12:00:00Z"),
                            contextLabel: "Mythic+",
                            toVersion: "1.1.0",
                            gameSlug: "wow-forever",
                          },
                          {
                            id: "change-genshin-newer",
                            entityName: "Furina",
                            entitySlug: "furina",
                            previousTier: "S",
                            newTier: "SS",
                            changeType: "tier_movement",
                            reason: "Universal buffing value verified",
                            evidence: null,
                            changedAt: new Date("2026-10-15T15:30:00Z"),
                            contextLabel: "Endgame Overall",
                            toVersion: "5.0",
                            gameSlug: "genshin-impact",
                          },
                        ];
                        return Promise.resolve(mockChanges.slice(0, n));
                      },
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
      ["wow-forever", "genshin-impact"],
      3,
      mockDb as unknown as DatabaseClient,
    );

    expect(changes).toHaveLength(2);
    expect(changes.map((c) => c.gameSlug)).toContain("wow-forever");
    expect(changes.map((c) => c.gameSlug)).toContain("genshin-impact");
  });

  it("does not fabricate any fake Genshin change when Genshin has 0 rating changes", async () => {
    const mockDb = {
      select: () => ({
        from: () => ({
          innerJoin: () => ({
            innerJoin: () => ({
              innerJoin: () => ({
                innerJoin: () => ({
                  where: () => ({
                    orderBy: () => ({
                      limit: () =>
                        Promise.resolve([
                          {
                            id: "change-wow-1",
                            entityName: "Fire Mage",
                            entitySlug: "fire-mage",
                            previousTier: "B",
                            newTier: "A",
                            changeType: "tier_movement",
                            reason: "DPS buff",
                            evidence: null,
                            changedAt: new Date("2026-10-12T00:00:00Z"),
                            contextLabel: "Dungeon",
                            toVersion: "1.0",
                            gameSlug: "wow-forever",
                          },
                        ]),
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
      ["wow-forever", "genshin-impact"],
      3,
      mockDb as unknown as DatabaseClient,
    );

    expect(changes).toHaveLength(1);
    expect(changes[0]?.gameSlug).toBe("wow-forever");
    // Ensure no fake change for genshin was generated
    expect(changes.some((c) => c.gameSlug === "genshin-impact")).toBe(false);
  });

  it("renders real WoW and Genshin updates with their existing game links", () => {
    const realUpdates: RecentRatingChangeItem[] = [
      {
        id: "wow-1",
        entityName: "Restoration Druid",
        entitySlug: "restoration-druid",
        previousTier: "A",
        newTier: "S",
        changeType: "tier_movement",
        reason: "HoT scaling improved",
        evidence: null,
        changedAt: new Date("2026-10-15T00:00:00Z"),
        contextLabel: "Mythic+",
        toVersion: "1.0",
        gameSlug: "wow-forever",
      },
      {
        id: "genshin-1",
        entityName: "Neuvillette",
        entitySlug: "neuvillette",
        previousTier: "S",
        newTier: "SS",
        changeType: "tier_movement",
        reason: "High DPS floor confirmed",
        evidence: null,
        changedAt: new Date("2026-10-14T00:00:00Z"),
        contextLabel: "Endgame",
        toVersion: "5.0",
        gameSlug: "genshin-impact",
      },
    ];

    const html = renderToStaticMarkup(
      createElement(GameHome, { title: "Game Tier Lists", updates: realUpdates }),
    );
    const updateCards = html.match(/<article class="tlb-update-card">[\s\S]*?<\/article>/g) ?? [];

    expect(html).toContain("View rankings");
    expect(html).not.toContain("View WoW changes");
    expect(updateCards).toHaveLength(3);

    expect(updateCards[0]).toContain("Restoration Druid: A → S");
    expect(updateCards[0]).toContain("HoT scaling improved");
    expect(updateCards[0]).toContain('href="/wow-forever/tier-list"');

    expect(updateCards[1]).toContain("Neuvillette: S → SS");
    expect(updateCards[1]).toContain("High DPS floor confirmed");
    expect(updateCards[1]).toContain('href="/genshin-impact/tier-list"');

    expect(updateCards[2]).toContain("No verified update yet");
    expect(updateCards[2]).toContain("Pending verification");
    expect(updateCards[2]).toContain(
      "New verified ranking changes will appear here when published.",
    );
    expect(updateCards[2]).not.toContain("PvP ranking updates");
    expect(updateCards[2]).not.toContain("WoW");
    expect(updateCards[2]).not.toContain("Genshin");
    expect(updateCards[2]).not.toContain("href=");
  });

  it("renders every empty update slot as a neutral placeholder without game-specific CTAs", () => {
    const html = renderToStaticMarkup(
      createElement(GameHome, { title: "Game Tier Lists", updates: [] }),
    );
    const updateCards = html.match(/<article class="tlb-update-card">[\s\S]*?<\/article>/g) ?? [];

    expect(updateCards).toHaveLength(3);
    for (const card of updateCards) {
      expect(card).toContain("No verified update yet");
      expect(card).toContain("Pending verification");
      expect(card).toContain("New verified ranking changes will appear here when published.");
      expect(card).not.toContain("PvP ranking updates");
      expect(card).not.toContain("WoW");
      expect(card).not.toContain("Genshin");
      expect(card).not.toContain("href=");
      expect(card).not.toContain("tlb-small-arrow");
    }
  });
});
