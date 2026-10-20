import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { vanguardAssets } from "@/config/vanguard.config";
import { WOW_CLASSES } from "@/modules/meta-board";
it("maps nine unique supplied emblems and the real WOW hero without inventing FOREVER", async () => {
  expect(Object.keys(vanguardAssets.emblems).sort()).toEqual([...WOW_CLASSES].sort());
  expect(new Set(Object.values(vanguardAssets.emblems)).size).toBe(9);
  const hashes = await Promise.all(
    Object.values(vanguardAssets.emblems).map(async (p) =>
      createHash("sha256")
        .update(await readFile(`public${p}`))
        .digest("hex"),
    ),
  );
  expect(new Set(hashes).size).toBe(9);
  expect(vanguardAssets.hero).toHaveProperty("wow.width", 1672);
  expect(vanguardAssets.hero).not.toHaveProperty("forever");
});
it("binds exact stable WOW IDs to unique mask-contained coordinates, excluding the O hole", async () => {
  const seen = new Set<string>();
  let count = 0;
  for (const [letter, file] of Object.entries({ W1: "w-left", O: "o-center", W2: "w-right" })) {
    const bytes = await readFile(`public/wow-forever/vanguard/layouts/wow-${letter}.f32`);
    const positions = new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4);
    const { data } = await sharp(`public/wow-forever/vanguard/masks/vanguard-mask-${file}.svg`)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    expect(positions.length).toBe(2672 * 4);
    for (let i = 0; i < 2672; i++) {
      const x = Math.floor(positions[i * 4]! * 10 + 836),
        y = Math.floor(470.5 - positions[i * 4 + 1]! * 10);
      expect(data[(y * 1672 + x) * 4 + 3]).toBe(255);
      const key = `${positions[i * 4]},${positions[i * 4 + 1]}`;
      expect(seen.has(key)).toBe(false);
      seen.add(key);
      count++;
    }
  }
  expect(count).toBe(8016);
});
it("uses the shipped compact coordinates for real catalog lookup and nearest Seat", async () => {
  const { createVanguardLayoutLookup } = await import("@/modules/wow-vanguard");
  const catalog = createVanguardLayoutLookup(vanguardAssets.layouts, async (url) => {
    const bytes = await readFile(`public${url}`);
    return Uint8Array.from(bytes).buffer;
  });
  expect(await catalog.exists("WOW-O-2672")).toBe(true);
  const nearest = await catalog.nearest("WOW-O-0001", new Set(["WOW-O-0001"]));
  expect(nearest).toMatch(/^WOW-/);
  expect(nearest).not.toBe("WOW-O-0001");
  await expect(catalog.exists("FOREVER-F-0001")).rejects.toMatchObject({
    code: "LAYOUT_UNAVAILABLE",
  });
});
