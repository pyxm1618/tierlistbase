import { expect, it } from "vitest";
import sharp from "sharp";
import { normalizeVanguardMaster, decideVanguardModeration } from "@/modules/wow-vanguard";
it("strips metadata and generates exact 512/1024/256/128 derivatives", async () => {
  const input = await sharp({
    create: { width: 1024, height: 1024, channels: 3, background: "blue" },
  })
    .withMetadata()
    .jpeg()
    .toBuffer();
  const output = await normalizeVanguardMaster(input, "image/jpeg");
  for (const [key, width] of [
    ["moderation", 512],
    ["detail", 1024],
    ["wow", 256],
    ["forever", 128],
  ] as const) {
    const meta = await sharp(output[key]).metadata();
    expect(meta.width).toBe(width);
    expect(meta.height).toBe(width);
    expect(meta.exif).toBeUndefined();
    expect(meta.icc).toBeUndefined();
  }
});
it("rejects unreadable, undersized, non-square and oversized masters", async () => {
  await expect(normalizeVanguardMaster(Buffer.from("bad"), "image/webp")).rejects.toMatchObject({
    code: "MEDIA_DECODE_FAILED",
  });
  for (const [width, height, code] of [
    [511, 511, "MEDIA_TOO_SMALL"],
    [512, 513, "MEDIA_FORMAT_INVALID"],
    [2049, 2049, "MEDIA_TOO_LARGE"],
  ] as const) {
    const image = await sharp({ create: { width, height, channels: 3, background: "blue" } })
      .webp()
      .toBuffer();
    await expect(normalizeVanguardMaster(image, "image/webp")).rejects.toMatchObject({ code });
  }
  await expect(
    normalizeVanguardMaster(Buffer.alloc(4 * 1024 * 1024 + 1), "image/webp"),
  ).rejects.toMatchObject({ code: "MEDIA_TOO_LARGE" });
});
it("never approves uncalibrated or invalid moderation, irrespective of normal combat", () => {
  expect(decideVanguardModeration({}, null)).toBe("uncertain");
  expect(decideVanguardModeration({ normal_game_combat: 1 }, null)).toBe("uncertain");
});

it("removes WebP EXIF, GPS and ICC without exceeding the bounded master", async () => {
  const input = await sharp({
    create: { width: 512, height: 512, channels: 3, background: "blue" },
  })
    .withMetadata()
    .webp()
    .toBuffer();
  expect((await sharp(input).metadata()).exif).toBeDefined();
  const output = await normalizeVanguardMaster(input, "image/webp");
  const metadata = await sharp(output.master).metadata();
  expect(metadata.exif).toBeUndefined();
  expect(metadata.icc).toBeUndefined();
  expect(metadata.width).toBe(512);
  expect(output.master.length).toBeLessThanOrEqual(input.length);
});
