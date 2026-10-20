import { validateLocalImage } from "./contracts";
export async function decodeLocalImage(file: File) {
  validateLocalImage(file);
  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("MEDIA_DECODE_FAILED");
  }
  if (bitmap.width < 512 || bitmap.height < 512) {
    bitmap.close();
    throw new Error("MEDIA_TOO_SMALL");
  }
  return bitmap;
}
// UI supplies a square in decoded image pixels. The original File never crosses OAuth.
export async function cropVanguardImage(
  bitmap: ImageBitmap,
  crop: { x: number; y: number; size: number },
) {
  if (
    ![crop.x, crop.y, crop.size].every(Number.isFinite) ||
    crop.size < 512 ||
    crop.x < 0 ||
    crop.y < 0 ||
    crop.x + crop.size > bitmap.width ||
    crop.y + crop.size > bitmap.height
  )
    throw new Error("MEDIA_TOO_SMALL");
  const canvas = document.createElement("canvas");
  canvas.width = canvas.height = Math.min(2048, Math.round(crop.size));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("MEDIA_DECODE_FAILED");
  context.drawImage(
    bitmap,
    crop.x,
    crop.y,
    crop.size,
    crop.size,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/webp", 0.9),
  );
  if (!blob) throw new Error("MEDIA_DECODE_FAILED");
  if (blob.size > 4 * 1024 * 1024) throw new Error("MEDIA_TOO_LARGE");
  return blob;
}
