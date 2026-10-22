import type { PublicInscription } from "../db/service";
import type { VanguardPhase } from "../domain/event";
export type VanguardManifest = {
  stage: "WOW_OPEN" | "WOW_COMPLETE_WAITING" | "FOREVER_OPEN" | "COMPLETE" | "SEALED";
  counts: { wow: number; forever: number; total: number };
  wowCompletedAt: string | null;
  foreverUnlockAt: string | null;
  eventCloseAt: string;
  phase: VanguardPhase;
  occupancy: string;
  version: string;
};
export type VanguardAssets = {
  hero: Partial<Record<VanguardPhase, { src: string; width: number; height: number }>>;
  layouts: Partial<Record<string, string>>;
  layoutScales?: Partial<Record<string, number>>;
  plates?: Partial<Record<"alliance" | "horde", string>>;
  focus?: string;
  ritual?: Partial<Record<"charge" | "form" | "inscribe" | "lock" | "ignite", string>>;
  effects?: Partial<Record<"alliance" | "horde" | "focus" | "ignite", string>>;
  plate: string | null;
  emblems: Partial<Record<string, string>>;
  bgm: string | null;
  sfx: Partial<Record<"focus" | "plate_formation" | "plate_insert" | "seat_ignite", string>>;
  seal: { portrait: string | null; square: string | null };
};
export type ClaimDraft = {
  seatId: string;
  holdToken?: string;
  displayName: string;
  faction: "" | "alliance" | "horde";
  className: string;
  guildName: string;
  battleCry: string;
};
export function draftFromStorage(raw: string | null): ClaimDraft | null {
  if (!raw || raw.length > 4096) return null;
  try {
    const parsed = JSON.parse(raw) as Record<string, unknown>;
    const { seatId, holdToken, displayName, faction, className, guildName, battleCry } = parsed;
    if (
      typeof seatId !== "string" ||
      !/^(WOW|FOREVER)-[A-Z][12]?-\d{4}$/.test(seatId) ||
      typeof displayName !== "string" ||
      typeof className !== "string" ||
      typeof guildName !== "string" ||
      typeof battleCry !== "string" ||
      !["", "alliance", "horde"].includes(String(faction)) ||
      displayName.length > 128 ||
      guildName.length > 192 ||
      battleCry.length > 480 ||
      className.length > 32 ||
      (holdToken !== undefined && (typeof holdToken !== "string" || !/^[\w-]{43}$/.test(holdToken)))
    )
      return null;
    return {
      seatId,
      ...(typeof holdToken === "string" ? { holdToken } : {}),
      displayName,
      faction: faction as ClaimDraft["faction"],
      className,
      guildName,
      battleCry,
    };
  } catch {
    return null;
  }
}
const MESSAGES: Record<string, string> = {
  EVENT_SEALED: "The inscription period has ended. The Monument is now sealed.",
  ACCOUNT_ALREADY_INSCRIBED: "You already have a place in the Monument.",
  SEAT_ALREADY_CLAIMED: "This place was just claimed. Choose another nearby seat.",
  HOLD_EXPIRED:
    "Your seat hold expired. Renew your hold to continue. Your text draft is preserved.",
  PHASE_NOT_OPEN: "This phase is not open for inscription.",
  MEDIA_FORMAT_INVALID: "Use a JPG, PNG or WebP image.",
  MEDIA_TOO_LARGE: "This image is too large. Choose an image under 20 MB.",
  MEDIA_TOO_SMALL: "This image is too small. Choose an image at least 512×512.",
  MEDIA_DECODE_FAILED: "We couldn’t read this image. Try another file.",
  UPLOAD_FAILED: "Upload failed. Try again.",
  MEDIA_MODERATION_REJECTED:
    "This image can’t be used. Choose another image or continue without one.",
  MODERATION_UNAVAILABLE:
    "We couldn’t verify this image right now. Try again or continue with your class emblem.",
  MEDIA_CHANGED: "This upload changed after verification. Choose the image again.",
  AUTH_REQUIRED: "Continue with Google to inscribe your place.",
  RATE_LIMITED: "Too many requests. Wait a moment and try again.",
  INVALID_INPUT: "Check the required fields and use plain text without links or contact details.",
  LAYOUT_UNAVAILABLE:
    "The final Monument layout is awaiting its approved assets. Browsing remains available.",
  SEAT_NOT_FOUND: "No inscription was found at this Seat ID.",
  MEDIA_NOT_FOUND: "This image is no longer available. Choose it again.",
  REPORT_NOTIFICATION_FAILED:
    "Your report was saved, but support could not be notified. Please contact support.",
  SERVICE_UNAVAILABLE: "The service is temporarily unavailable. Try again.",
};
export function vanguardErrorMessage(code: string) {
  return MESSAGES[code] ?? "The request could not be completed. Try again.";
}
export function validateLocalImage(file: { type: string; size: number }) {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type))
    throw new Error("MEDIA_FORMAT_INVALID");
  if (file.size > 20 * 1024 * 1024) throw new Error("MEDIA_TOO_LARGE");
}
export const RITUAL_PRE_FRAMES = ["camera_focus", "gather", "memory", "faction_energy"] as const;

export const RITUAL_POST_FRAMES = [
  "plate_formation",
  "name_and_seat",
  "stone_carve",
  "plate_insert",
  "seat_ignite",
  "camera_pull_back",
] as const;

export const RITUAL_FRAMES = [...RITUAL_PRE_FRAMES, ...RITUAL_POST_FRAMES] as const;
export type RitualFrame = (typeof RITUAL_FRAMES)[number] | "reveal";
export async function runVanguardRitual(
  render: (frame: RitualFrame, reducedMotion: boolean) => void,
  reducedMotion: boolean,
  frames: readonly (typeof RITUAL_FRAMES)[number][] = RITUAL_FRAMES,
  durationMs = 4000,
) {
  for (const [index, frame] of frames.entries()) {
    render(frame, reducedMotion);
    await new Promise<void>((resolve) =>
      setTimeout(
        resolve,
        Math.round(((index + 1) * durationMs) / frames.length) -
          Math.round((index * durationMs) / frames.length),
      ),
    );
  }
  render("reveal", reducedMotion);
}
export async function runPostSuccessRitual(
  render: (frame: RitualFrame, reducedMotion: boolean) => void,
  reducedMotion: boolean,
  durationMs = 1100,
) {
  const pullbackDuration = reducedMotion ? 0 : Math.min(500, durationMs);
  const leadDuration = Math.max(0, durationMs - pullbackDuration);
  const leadFrames = RITUAL_POST_FRAMES.slice(0, -1);
  for (const [index, frame] of leadFrames.entries()) {
    render(frame, reducedMotion);
    await new Promise<void>((resolve) =>
      setTimeout(
        resolve,
        Math.round(((index + 1) * leadDuration) / leadFrames.length) -
          Math.round((index * leadDuration) / leadFrames.length),
      ),
    );
  }
  render("camera_pull_back", reducedMotion);
  if (pullbackDuration) await new Promise<void>((resolve) => setTimeout(resolve, pullbackDuration));
  render("reveal", reducedMotion);
}
export function sealInput(seat: Extract<PublicInscription, { status: "active" }>, origin: string) {
  return {
    displayName: seat.displayName,
    seatId: seat.seatId,
    faction: seat.faction,
    className: seat.className,
    guildName: seat.guildName,
    battleCry: seat.battleCry,
    image: seat.image,
    inscribedAt: seat.inscribedAt,
    monumentLocation: seat.seatId,
    qrPayload: `${origin}/wow-forever/vanguard?seat=${encodeURIComponent(seat.seatId)}`,
    disclaimer: "Unofficial Community Tribute",
    formats: ["9:16", "1:1"] as const,
  };
}
export type SealInput = ReturnType<typeof sealInput>;
export interface SealRenderer {
  render(input: SealInput, format: "9:16" | "1:1"): Promise<Blob>;
}

export function ritualSound(
  frame: RitualFrame,
): Exclude<keyof VanguardAssets["sfx"], "focus"> | null {
  return frame === "plate_formation" || frame === "plate_insert" || frame === "seat_ignite"
    ? frame
    : null;
}
