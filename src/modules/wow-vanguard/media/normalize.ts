import { createHash } from "node:crypto";
import { VanguardError } from "../domain/event";
import { vanguardImageHeader, stripVanguardWebpMetadata } from "./image-header";
export async function normalizeVanguardMaster(bytes: Buffer, mime: string) {
  if (bytes.length > 4 * 1024 * 1024) throw new VanguardError("MEDIA_TOO_LARGE", 422);
  const header = vanguardImageHeader(bytes);
  if (header.mime !== mime) throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
  if (header.width < 512 || header.height < 512) throw new VanguardError("MEDIA_TOO_SMALL", 422);
  if (header.width > 2048 || header.height > 2048) throw new VanguardError("MEDIA_TOO_LARGE", 422);
  if (header.width !== header.height) throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
  // Runtime-conditional package exports select Node or workerd WASM, without native add-ons.
  const { PhotonImage, resize, SamplingFilter } = await import("@cf-wasm/photon");
  let image: InstanceType<typeof PhotonImage> | undefined;
  try {
    image = PhotonImage.new_from_byteslice(bytes);
    if (image.get_width() !== header.width || image.get_height() !== header.height)
      throw new VanguardError("MEDIA_FORMAT_INVALID", 422);
    // Fresh pixel encoding does not carry source EXIF, GPS, ICC or other metadata.
    const master =
      mime === "image/webp"
        ? stripVanguardWebpMetadata(bytes)
        : Buffer.from(image.get_bytes_webp());
    if (master.length > 4 * 1024 * 1024) throw new VanguardError("MEDIA_TOO_LARGE", 422);
    const derivative = (size: number) => {
      const resized = resize(image!, size, size, SamplingFilter.Lanczos3);
      try {
        return Buffer.from(resized.get_bytes_webp());
      } finally {
        resized.free();
      }
    };
    return {
      master,
      moderation: derivative(512),
      detail: derivative(1024),
      wow: derivative(256),
      forever: derivative(128),
      width: header.width,
      height: header.height,
      sha256: createHash("sha256").update(master).digest("hex"),
    };
  } catch (error) {
    if (error instanceof VanguardError) throw error;
    throw new VanguardError("MEDIA_DECODE_FAILED", 422);
  } finally {
    image?.free();
  }
}
