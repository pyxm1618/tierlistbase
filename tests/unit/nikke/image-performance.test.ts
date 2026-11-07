import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const avatarsDir = path.resolve(
  new URL("../../../src/modules/nikke-tier-list/assets/avatars", import.meta.url).pathname,
);
const FEATURE_CSS_WIDTH = 132;
const TARGET_DPR = 2;
const MIN_FEATURE_SOURCE_WIDTH = FEATURE_CSS_WIDTH * TARGET_DPR;
const MAX_AVATAR_WIDTH = 272;
const MAX_AVATAR_HEIGHT = 544;
const MAX_BYTES = 128 * 1024;

describe("NIKKE avatar production image performance gate", () => {
  it("keeps all 203 avatars inside the feature-image display contract", async () => {
    const files = readdirSync(avatarsDir).filter((file) => !file.startsWith("."));
    expect(files).toHaveLength(203);

    for (const file of files) {
      expect(path.extname(file)).toBe(".webp");
      const full = path.join(avatarsDir, file);
      expect(statSync(full).size).toBeLessThanOrEqual(MAX_BYTES);

      const metadata = await sharp(full).metadata();
      expect(metadata.format).toBe("webp");
      expect(metadata.hasAlpha).toBe(true);
      expect(metadata.width ?? 0).toBeGreaterThanOrEqual(MIN_FEATURE_SOURCE_WIDTH);
      expect(metadata.width ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(MAX_AVATAR_WIDTH);
      expect(metadata.height ?? Number.POSITIVE_INFINITY).toBeLessThanOrEqual(MAX_AVATAR_HEIGHT);
    }
  });
});
