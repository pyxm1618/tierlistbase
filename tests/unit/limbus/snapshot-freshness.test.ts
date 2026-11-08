import { readFileSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import { routeRegistry } from "@/config/routes.config";
import { masterSourceMetadata } from "@/modules/limbus-tier-list/data/index";

const route = "/limbus-company/tier-list";
const UNSUPPORTED_CURRENT_CLAIM =
  /\\bcurrent meta\\b|\\bcurrent rankings?\\b|\\blatest rankings?\\b|\\blive rankings?\\b|\\breal-time rankings?\\b/i;

function limbusDefinition() {
  const definition = routeRegistry.get(route);
  if (definition.class !== "public_indexable") throw new Error("Limbus route must be indexable");
  return definition;
}

describe("Limbus ranking snapshot freshness", () => {
  it("uses structured runtime version, source-update and review metadata", () => {
    expect(masterSourceMetadata.gameVersion).toMatch(/^\\d+(?:\\.\\d+)+$/);
    expect(masterSourceMetadata.sourceUpdatedAt).toMatch(/^\\d{4}-\\d{2}-\\d{2}$/);
    expect(masterSourceMetadata.reviewedAt).toMatch(/^\\d{4}-\\d{2}-\\d{2}$/);
    expect(masterSourceMetadata.reviewedAt >= masterSourceMetadata.sourceUpdatedAt).toBe(true);
    expect(masterSourceMetadata.identitiesCount).toBe(190);
    expect(masterSourceMetadata.egoCount).toBe(116);
    expect(masterSourceMetadata.teamsCount).toBe(12);
  });

  it("keeps route metadata free of unsupported current-ranking claims", () => {
    const definition = limbusDefinition();
    for (const field of [definition.title, definition.description, definition.searchIntent]) {
      expect(field).not.toMatch(UNSUPPORTED_CURRENT_CLAIM);
    }
    expect(definition.lastModified >= masterSourceMetadata.reviewedAt).toBe(true);
  });

  it("reads visible snapshot facts from the master source instead of hardcoding them", () => {
    const source = readFileSync(
      path.join(process.cwd(), "src/modules/limbus-tier-list/limbus-tier-list.tsx"),
      "utf8",
    );

    expect(source).toContain("masterSourceMetadata.gameVersion");
    expect(source).toContain("masterSourceMetadata.sourceUpdatedAt");
    expect(source).toContain("masterSourceMetadata.reviewedAt");
    expect(source).toContain('aria-label="Ranking snapshot context"');
    expect(source).not.toContain(masterSourceMetadata.gameVersion);
    expect(source).not.toContain(masterSourceMetadata.sourceUpdatedAt);
    expect(source).not.toContain(masterSourceMetadata.reviewedAt);
    expect(source).not.toMatch(UNSUPPORTED_CURRENT_CLAIM);
  });
});
