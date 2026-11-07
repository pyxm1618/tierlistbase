import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { snapshotDate, snapshotPhase, snapshotVersion } from "@/modules/nikke-tier-list/data";

/**
 * Minimal NIKKE freshness regression: the recorded ranking snapshot is the single source of
 * truth, so page and metadata wording must describe that snapshot instead of claiming live
 * rankings. If the recorded data moves to a new version or phase, these assertions fail until
 * the copy is reviewed again.
 */
const CURRENT_RANKING_CLAIM =
  /\bcurrent (?:character |meta )?\w*rankings?\b|\blatest (?:character )?rankings?\b|\breal-time rankings?\b|\bup-to-date rankings?\b/i;
const SINGLE_CURRENT_WORD = /\b(?:current|latest|real-time|up-to-date)\b/i;

const route = "/nikke/tier-list";
const pageSources = [
  "src/modules/nikke-tier-list/nikke-tier-list.tsx",
  "src/app/(marketing)/nikke/tier-list/page.tsx",
];

function formatRecordedDate(value: string): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}

function nikkeDefinition() {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") throw new Error("NIKKE route must be indexable");
  return definition;
}

describe("NIKKE ranking freshness", () => {
  it("exposes a structured version, phase and date from the recorded snapshot", () => {
    expect(snapshotDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(snapshotVersion).toMatch(/^v\d+(?:\.\d+)*$/);
    expect(snapshotPhase.length).toBeGreaterThan(0);
  });

  it("describes the recorded snapshot in metadata and never claims current rankings", () => {
    const definition = nikkeDefinition();

    for (const field of [definition.title, definition.description, definition.searchIntent]) {
      expect(field).not.toMatch(CURRENT_RANKING_CLAIM);
      expect(field).not.toMatch(SINGLE_CURRENT_WORD);
    }

    expect(definition.description).toContain(snapshotVersion);
    expect(definition.description.toLowerCase()).toContain(snapshotPhase.toLowerCase());
    expect(definition.description).toContain(formatRecordedDate(snapshotDate));
  });

  it("publishes metadata that is not older than the recorded snapshot", () => {
    const definition = nikkeDefinition();
    expect(definition.lastModified >= snapshotDate).toBe(true);
  });

  it("keeps page components reading the snapshot instead of hardcoding it", () => {
    const root = process.cwd();
    for (const relativePath of pageSources) {
      const source = readFileSync(path.join(root, relativePath), "utf8");
      expect(source, `${relativePath} must not hardcode the snapshot date`).not.toContain(
        snapshotDate,
      );
      expect(source, `${relativePath} must not hardcode the game version`).not.toContain(
        snapshotVersion,
      );
    }
  });
});
