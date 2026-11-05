import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { VanguardEntry } from "@/modules/wow-vanguard/client/entry";
import type { VanguardAssets, VanguardManifest } from "@/modules/wow-vanguard/client/contracts";

const assets: VanguardAssets = {
  hero: {},
  layouts: {},
  plate: null,
  emblems: {},
  bgm: null,
  sfx: {},
  seal: { portrait: null, square: null },
};

function manifest(stage: VanguardManifest["stage"]): VanguardManifest {
  return {
    stage,
    counts: {
      wow: stage === "WOW_OPEN" ? 1 : 8016,
      forever: stage === "COMPLETE" ? 56112 : 0,
      total: stage === "COMPLETE" ? 64128 : stage === "WOW_OPEN" ? 1 : 8016,
    },
    wowCompletedAt: stage === "WOW_OPEN" ? null : "2026-10-19T12:00:00.000Z",
    foreverUnlockAt: stage === "WOW_OPEN" ? null : "2026-10-20T12:00:00.000Z",
    eventCloseAt: "2026-11-04T23:00:00Z",
    phase: stage === "FOREVER_OPEN" || stage === "COMPLETE" ? "forever" : "wow",
    occupancy: "",
    version: "a".repeat(64),
  };
}

function renderStage(stage: VanguardManifest["stage"]) {
  return renderToStaticMarkup(
    createElement(VanguardEntry, {
      manifest: manifest(stage),
      classes: [],
      assets,
      initialSeat: null,
      authenticated: false,
      heading: "8016 Vanguard Monument",
    }),
  );
}

describe("Vanguard stable SEO heading", () => {
  it("keeps the registered page identity as the only H1 while WOW is open", () => {
    const markup = renderStage("WOW_OPEN");

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain(">8016 Vanguard Monument</h1>");
  });

  it("keeps the registered page identity as the only H1 after the monument seals", () => {
    const markup = renderStage("SEALED");

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain(">8016 Vanguard Monument</h1>");
    expect(markup).toContain('role="status"');
    expect(markup).toContain("THE MONUMENT IS SEALED");
    expect(markup).toContain(
      "The inscription period has ended. Every completed Vanguard remains here to explore.",
    );
  });

  it.each([
    ["WOW_COMPLETE_WAITING", "WOW IS COMPLETE"],
    ["FOREVER_OPEN", "FOREVER IS OPEN"],
    ["COMPLETE", "THE MONUMENT IS COMPLETE"],
    ["SEALED", "THE MONUMENT IS SEALED"],
  ] as const)("preserves %s lifecycle status outside the H1", (stage, status) => {
    const markup = renderStage(stage);

    expect(markup.match(/<h1\b/g)).toHaveLength(1);
    expect(markup).toContain(">8016 Vanguard Monument</h1>");
    expect(markup).toContain('role="status"');
    expect(markup).toContain(status);
  });
});
