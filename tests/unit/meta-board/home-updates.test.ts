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

  it("renders WoW real change, Genshin real change, and placeholder correctly without fake tier movement", () => {
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

    // Section header has neutral link
    expect(html).toContain("View rankings");
    expect(html).not.toContain("View WoW changes");

    // WoW card
    expect(html).toContain("Restoration Druid: A → S");
    expect(html).toContain("HoT scaling improved");
    expect(html).toContain("/wow-forever/tier-list");

    // Genshin card
    expect(html).toContain("Neuvillette: S → SS");
    expect(html).toContain("High DPS floor confirmed");
    expect(html).toContain("/genshin-impact/tier-list");

    // 3rd card is placeholder (no fake tier movement, pending verification)
    expect(html).toContain("Pending verification");
    expect(html).toContain("No verified update has been published here yet.");
    expect(html).toContain("PvP ranking updates");
    expect(html).not.toContain("PvP ranking updates:");
    expect(html).not.toContain("PvP ranking updates: ");
  });
});
