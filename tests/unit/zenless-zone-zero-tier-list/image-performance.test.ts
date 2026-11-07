import { createHash } from "node:crypto";
import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const root = path.resolve(new URL("../../..", import.meta.url).pathname);
const assetsRoot = path.join(root, "src/modules/zenless-zone-zero-tier-list/assets");
const manifest = JSON.parse(
  readFileSync(path.join(root, "zzz-asset-manifest.json"), "utf8"),
) as Record<string, unknown>;

const policies = {
  agents: {
    maxDimension: 192,
    maxBytes: 24576,
  },
  "w-engines": {
    maxDimension: 96,
    maxBytes: 12288,
  },
  bangboo: {
    maxDimension: 96,
    maxBytes: 8192,
  },
  teams: {
    maxDimension: 1536,
    maxBytes: 311296,
  },
} as const;

describe("ZZZ production image performance gate", () => {
  for (const [category, policy] of Object.entries(policies)) {
    it(category + " stays within production image budgets", async () => {
      const dir = path.join(assetsRoot, category);
      const files = readdirSync(dir).filter((file) => !file.startsWith("."));
      expect(files.length).toBeGreaterThan(0);
      for (const file of files) {
        expect(path.extname(file)).toBe(".webp");
        const full = path.join(dir, file);
        expect(statSync(full).size).toBeLessThanOrEqual(policy.maxBytes);
        const metadata = await sharp(full).metadata();
        expect(Math.max(metadata.width ?? 0, metadata.height ?? 0)).toBeLessThanOrEqual(
          policy.maxDimension,
        );
      }
    });
  }

  it("keeps reviewed provenance while matching transformed production files", async () => {
    const groups = ["agentPortraits", "bangboo", "wEngines", "teamVisuals"] as const;
    for (const group of groups) {
      const entries = manifest[group] as Array<Record<string, unknown>>;
      for (const entry of entries) {
        expect(entry.verified).toBe(true);
        expect(entry.reviewState).toBe("approved/pass");
        expect(entry.sourceURL).toBeTruthy();
        expect(entry.sourcePage).toBeTruthy();
        expect(entry.sourceType).toBeTruthy();
        if (group === "agentPortraits") {
          expect(entry.identitySource).toBeTruthy();
          expect(entry.officialSourceName).toBeTruthy();
        }
        expect(entry.productionTransformation).toBe("resize + WebP encode");
        expect(entry.format).toBe("WebP");
        const filename = String(entry.filename);
        const bytes = readFileSync(path.join(root, filename));
        expect(bytes.byteLength).toBe(entry.byteSize);
        expect(createHash("sha256").update(bytes).digest("hex")).toBe(entry.sha256);
        const metadata = await sharp(path.join(root, filename)).metadata();
        expect({ width: metadata.width, height: metadata.height }).toEqual(entry.resolution);
      }
    }
  });
});
