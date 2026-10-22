import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import sharp from "sharp";
import { vanguardAssets } from "@/config/vanguard.config";
import { WOW_CLASSES } from "@/modules/meta-board";
it("maps nine unique supplied emblems and the real WOW hero and supplied FOREVER hero", async () => {
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
  expect(vanguardAssets.hero).toHaveProperty("forever.width", 1774);
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
it("keeps WOW W masks on the visible stone faces instead of sky and glow gaps", async () => {
  const samples = {
    "w-left": {
      outside: [
        [130, 500],
        [320, 400],
        [390, 650],
        [590, 650],
      ],
      inside: [
        [200, 400],
        [360, 450],
        [540, 400],
        [300, 600],
        [480, 600],
      ],
    },
    "w-right": {
      outside: [
        [1040, 600],
        [1350, 400],
        [1282, 650],
        [1510, 550],
      ],
      inside: [
        [1100, 400],
        [1272, 430],
        [1450, 400],
        [1200, 600],
        [1370, 600],
      ],
    },
  } as const;
  for (const [file, points] of Object.entries(samples)) {
    const { data } = await sharp(`public/wow-forever/vanguard/masks/vanguard-mask-${file}.svg`)
      .ensureAlpha()
      .raw()
      .toBuffer({ resolveWithObject: true });
    for (const [x, y] of points.outside) expect(data[(y * 1672 + x) * 4 + 3]).toBe(0);
    for (const [x, y] of points.inside) expect(data[(y * 1672 + x) * 4 + 3]).toBe(255);
  }
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
  expect(await catalog.exists("FOREVER-F-0001")).toBe(true);
});
