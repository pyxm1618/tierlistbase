import { z } from "zod";
import { parseSeatId } from "../domain/event";
const seatId = z.string().refine((value) => {
  try {
    parseSeatId(value);
    return true;
  } catch {
    return false;
  }
});
const mediaUrl = z.url().refine((value) => {
  const url = new URL(value);
  return (
    url.origin === "https://media.tierlistbase.com" &&
    /^\/vanguard\/permanent\/[a-f0-9-]{36}\/(detail|wow-256|forever-128)\.webp$/.test(
      url.pathname,
    ) &&
    !url.search &&
    !url.hash
  );
});
export const publicSeatResponse = z.discriminatedUnion("status", [
  z.object({ seatId, status: z.literal("unavailable") }),
  z.object({
    seatId,
    status: z.literal("active"),
    displayName: z.string().min(2).max(128),
    faction: z.enum(["alliance", "horde"]),
    className: z.string().min(1).max(32),
    guildName: z.string().max(192).nullable(),
    battleCry: z.string().max(480).nullable(),
    inscribedAt: z.iso.datetime(),
    image: z.object({ detail: mediaUrl, wow: mediaUrl, forever: mediaUrl }).nullable(),
  }),
]);
export const manifestResponse = z
  .object({
    stage: z.enum(["WOW_OPEN", "WOW_COMPLETE_WAITING", "FOREVER_OPEN", "COMPLETE", "SEALED"]),
    counts: z.object({
      wow: z.number().int().min(0).max(8016),
      forever: z.number().int().min(0).max(56112),
      total: z.number().int().min(0).max(64128),
    }),
    wowCompletedAt: z.iso.datetime().nullable(),
    foreverUnlockAt: z.iso.datetime().nullable(),
    eventCloseAt: z.iso.datetime(),
    phase: z.enum(["wow", "forever"]),
    occupancy: z.string().max(9352),
    version: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .refine((value) => value.counts.wow + value.counts.forever === value.counts.total);
export function parseVanguardResponse(path: string, value: unknown) {
  if (path.startsWith("inscriptions")) return publicSeatResponse.parse(value);
  if (path === "me") return z.object({ inscription: publicSeatResponse.nullable() }).parse(value);
  if (path.startsWith("search?"))
    return z.object({ results: z.array(publicSeatResponse).max(20) }).parse(value);
  if (path === "holds")
    return z
      .object({ seatId, holdToken: z.string().regex(/^[\w-]{43}$/), expiresAt: z.iso.datetime() })
      .parse(value);
  if (path === "media/presign")
    return z
      .object({ mediaId: z.uuid(), uploadUrl: z.url(), contentType: z.literal("image/webp") })
      .parse(value);
  if (path === "media/complete")
    return z.object({ mediaId: z.uuid(), status: z.literal("approved") }).parse(value);
  if (path === "reports") return z.object({ received: z.literal(true) }).parse(value);
  return value;
}
