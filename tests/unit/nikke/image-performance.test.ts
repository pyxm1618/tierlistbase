import { readdirSync, statSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const avatarsDir = path.resolve(
  new URL("../../../src/modules/nikke-tier-list/assets/avatars", import.meta.url).pathname,
);
const MAX_DIMENSION = 320;
const MAX_BYTES = 36864;

describe("NIKKE avatar production image performance gate", () => {
  it("keeps all 203 avatars within the 2x feature-image budget", async () => {
    const files = readdirSync(avatarsDir).filter((file) => !file.startsWith("."));
    expect(files).toHaveLength(203);
    for (const file of files) {
      expect(path.extname(file)).toBe(".webp");
      const full = path.join(avatarsDir, file);
      expect(statSync(full).size).toBeLessThanOrEqual(MAX_BYTES);
      const metadata = await sharp(full).metadata();
      expect(Math.max(metadata.width ?? 0, metadata.height ?? 0)).toBeLessThanOrEqual(
        MAX_DIMENSION,
      );
    }
  });
});
