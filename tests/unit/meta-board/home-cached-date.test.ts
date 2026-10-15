import { expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { GameHome } from "@/components/home/game-home";
import type { RecentRatingChangeItem } from "@/modules/meta-board";
it("renders homepage rating changes after Next cache serializes Date as an ISO string", () => {
  const update = {
    id: "cached-change",
    entityName: "Observed Spec",
    previousTier: "B",
    newTier: "A",
    reason: "Observed ranking movement",
    contextLabel: "Dungeon",
    changedAt: "2026-10-15T00:00:00.000Z",
  } as unknown as RecentRatingChangeItem;
  expect(() =>
    renderToStaticMarkup(createElement(GameHome, { title: "Game Tier Lists", updates: [update] })),
  ).not.toThrow();
  const html = renderToStaticMarkup(
    createElement(GameHome, { title: "Game Tier Lists", updates: [update] }),
  );
  expect(html).toContain("Oct 15, 2026");
});
