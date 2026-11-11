import { createElement } from "react";
import { renderToReadableStream } from "react-dom/server";
import { expect, it } from "vitest";

import { GameHome } from "@/components/home/game-home";
import type { RecentRatingChangeItem } from "@/modules/meta-board";

// The homepage streams its ranking updates block from a promise so a slow ranking
// read cannot delay first paint. renderToStaticMarkup cannot render that path, so
// this test drives the streaming renderer directly.
it("renders the streamed homepage updates from a pending promise", async () => {
  const update = {
    id: "streamed-change",
    entityName: "Streamed Entity",
    previousTier: "B",
    newTier: "A",
    reason: "Observed ranking movement",
    contextLabel: "Dungeon",
    gameSlug: "wild-rift",
    changedAt: new Date("2026-10-15T00:00:00.000Z"),
  } as unknown as RecentRatingChangeItem;

  const stream = await renderToReadableStream(
    createElement(GameHome, {
      title: "Game Tier Lists",
      updates: Promise.resolve([update]),
      featuredGames: [],
    }),
  );
  await stream.allReady;
  const html = await new Response(stream).text();

  expect(html).toContain('id="latest-updates"');
  expect(html).toContain("Latest Updates");
  expect(html).toContain("Streamed Entity");
});

it("omits the updates section when the streamed read is empty", async () => {
  const stream = await renderToReadableStream(
    createElement(GameHome, {
      title: "Game Tier Lists",
      updates: Promise.resolve([]),
      featuredGames: [],
    }),
  );
  await stream.allReady;
  const html = await new Response(stream).text();

  expect(html).not.toContain('id="latest-updates"');
});
