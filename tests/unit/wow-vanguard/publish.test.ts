import { randomUUID, createHash } from "node:crypto";
import { expect, it, vi } from "vitest";
import sharp from "sharp";
import { createVanguardMediaPublisher, type vanguardMedia } from "@/modules/wow-vanguard";
async function fixture() {
  const bytes = await sharp({
    create: { width: 512, height: 512, channels: 3, background: "blue" },
  })
    .webp()
    .toBuffer();
  const media = {
    id: randomUUID(),
    moderationStatus: "approved",
    sha256: createHash("sha256").update(bytes).digest("hex"),
    privateMasterKey: "private/master.webp",
  } as typeof vanguardMedia.$inferSelect;
  return { bytes, media };
}
it("publishes only all three approved permanent derivatives", async () => {
  const { bytes, media } = await fixture();
  const published: string[] = [];
  const revoke = vi.fn();
  const publish = createVanguardMediaPublisher({
    readPending: async () => bytes,
    publishApproved: async (key, body, approved) => {
      expect(approved).toBe(true);
      expect((await sharp(body).metadata()).exif).toBeUndefined();
      published.push(key);
    },
    revoke,
  });
  const keys = await publish(media);
  expect(published).toEqual(Object.values(keys));
  expect(published.map((key) => key.split("/").at(-1))).toEqual([
    "detail.webp",
    "wow-256.webp",
    "forever-128.webp",
  ]);
  expect(revoke).not.toHaveBeenCalled();
});
it("rejects a presigned overwrite after moderation without publishing anything", async () => {
  const { media } = await fixture();
  const publishApproved = vi.fn();
  await expect(
    createVanguardMediaPublisher({
      readPending: async () => Buffer.from("replaced"),
      publishApproved,
      revoke: vi.fn(),
    })(media),
  ).rejects.toMatchObject({ code: "MEDIA_CHANGED" });
  expect(publishApproved).not.toHaveBeenCalled();
});
it("revokes every deterministic permanent key when a partial publication fails", async () => {
  const { bytes, media } = await fixture();
  const revoke = vi.fn(async () => {});
  let calls = 0;
  await expect(
    createVanguardMediaPublisher({
      readPending: async () => bytes,
      publishApproved: async () => {
        if (++calls === 2) throw new Error("R2 unavailable");
      },
      revoke,
    })(media),
  ).rejects.toThrow("R2 unavailable");
  expect(revoke).toHaveBeenCalledWith([
    `vanguard/permanent/${media.id}/detail.webp`,
    `vanguard/permanent/${media.id}/wow-256.webp`,
    `vanguard/permanent/${media.id}/forever-128.webp`,
  ]);
});
