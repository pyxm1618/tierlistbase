import { expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { vanguardAssets } from "@/config/vanguard.config";
it("connects all ten supplied groups with matching image coordinate systems", async () => {
  expect(Object.keys(vanguardAssets.layouts)).toHaveLength(10);
  expect(vanguardAssets.hero).toHaveProperty("forever.width", 1774);
  let wow = 0,
    forever = 0;
  for (const [key, path] of Object.entries(vanguardAssets.layouts)) {
    const bytes = await readFile(`public${path}`);
    const count = bytes.byteLength / 16;
    if (key.startsWith("wow:")) {
      expect(count).toBe(2672);
      wow += count;
    } else {
      expect(count).toBe(8016);
      forever += count;
    }
  }
  expect([wow, forever, wow + forever]).toEqual([8016, 56112, 64128]);
});
it("preserves every supplied FINAL rectangle, local row identity and full opaque mask footprint", async () => {
  const sharp = (await import("sharp")).default;
  let total = 0,
    failures = 0;
  for (const source of [
    {
      phase: "wow",
      file: "vanguard-seat-layout-8016-final.json",
      scale: 1,
      width: 1672,
      height: 941,
      keys: { w_left: "W1", o_center: "O", w_right: "W2" },
    },
    {
      phase: "forever",
      file: "vanguard-forever-seat-layout-56112.json",
      scale: 4,
      width: 1774,
      height: 887,
      keys: { f: "F", o: "O", r1: "R1", e1: "E1", v: "V", e2: "E2", r2: "R2" },
    },
  ]) {
    const layout = JSON.parse(
      await readFile(`docs/wow-forever-vanguard/implementation/seat-layout/${source.file}`, "utf8"),
    );
    const occupied = new Set<number>();
    for (const [key, letter] of Object.entries(source.keys)) {
      const group = layout.letters[key];
      const buffer = await readFile(
        `public/wow-forever/vanguard/layouts/${source.phase}-${letter}.f32`,
      );
      const positions = new Float32Array(buffer.buffer, buffer.byteOffset, buffer.byteLength / 4);
      const { data, info } = await sharp(`public/wow-forever/vanguard/masks/${group.maskFile}`, {
        density: 72 * source.scale,
      })
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      expect([info.width, info.height]).toEqual([
        source.width * source.scale,
        source.height * source.scale,
      ]);
      for (const [index, seat] of group.seats.entries() as IterableIterator<
        [number, { x: number; y: number }]
      >) {
        if (
          positions[index * 4] !==
            Math.fround(((seat.x + 2) / source.scale - source.width / 2) / 10) ||
          positions[index * 4 + 1] !==
            Math.fround((source.height / 2 - (seat.y + 2) / source.scale) / 10)
        )
          failures++;
        for (let y = seat.y; y < seat.y + 4; y++)
          for (let x = seat.x; x < seat.x + 4; x++) {
            const pixel = y * info.width + x;
            if (data[pixel * 4 + 3] !== 255 || occupied.has(pixel)) failures++;
            occupied.add(pixel);
          }
        total++;
      }
    }
  }
  expect(failures).toBe(0);
  expect(total).toBe(64128);
});
