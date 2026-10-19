import { createHash } from "node:crypto";
import sharp, { type Metadata } from "sharp";
import { VanguardError } from "../domain/event";
const FORMATS: Record<string, string> = {
  "image/jpeg": "jpeg",
  "image/png": "png",
  "image/webp": "webp",
};
export async function normalizeVanguardMaster(bytes: Buffer, mime: string) {
  if (bytes.byteLength > 4 * 1024 * 1024) throw new VanguardError("MEDIA_TOO_LARGE", 422);
  if (!FORMATS[mime]) throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
  let meta: Metadata;
  try {
    meta = await sharp(bytes, { limitInputPixels: false }).metadata();
  } catch {
    throw new VanguardError("MEDIA_DECODE_FAILED", 422);
  }
  if (meta.format !== FORMATS[mime] || (meta.pages ?? 1) !== 1)
    throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
  if (!meta.width || !meta.height) throw new VanguardError("MEDIA_DECODE_FAILED", 422);
  if (meta.width < 512 || meta.height < 512) throw new VanguardError("MEDIA_TOO_SMALL", 422);
  if (meta.width > 2048 || meta.height > 2048) throw new VanguardError("MEDIA_TOO_LARGE", 422);
  if (meta.width !== meta.height) throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
  try {
    // Sharp strips metadata by default; never call keepMetadata/withMetadata here.
    const master = await sharp(bytes, { limitInputPixels: 2048 * 2048 })
      .rotate()
      .webp({ quality: 90 })
      .toBuffer();
    const derivative = (size: number) =>
      sharp(master).resize(size, size).webp({ quality: 85 }).toBuffer();
    const [moderation, detail, wow, forever] = await Promise.all(
      [512, 1024, 256, 128].map(derivative),
    );
    return {
      master,
      moderation: moderation!,
      detail: detail!,
      wow: wow!,
      forever: forever!,
      width: meta.width,
      height: meta.height,
      sha256: createHash("sha256").update(master).digest("hex"),
    };
  } catch {
    throw new VanguardError("MEDIA_DECODE_FAILED", 422);
  }
}
