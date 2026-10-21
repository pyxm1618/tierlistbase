import { z } from "zod";
export const VANGUARD_CALIBRATION_CATEGORIES = [
  "wow_screenshot",
  "wow_combat",
  "guild_group",
  "person_photo",
  "advertisement",
  "qr",
  "sexual_explicit",
  "graphic_gore",
] as const;
const sample = z
  .object({
    id: z.string().regex(/^[a-z0-9_-]{1,32}$/),
    category: z.enum(VANGUARD_CALIBRATION_CATEGORIES),
    expected: z.enum(["approved", "rejected"]),
    file: z.string().min(1).max(1024),
    mime: z.enum(["image/jpeg", "image/png", "image/webp"]),
  })
  .strict();
export function validateVanguardCalibrationManifest(input: unknown) {
  const result = z
    .object({ samples: z.array(sample).min(8).max(200) })
    .strict()
    .parse(input);
  if (new Set(result.samples.map((row) => row.id)).size !== result.samples.length)
    throw new Error("Calibration IDs must be unique");
  for (const category of VANGUARD_CALIBRATION_CATEGORIES)
    if (!result.samples.some((row) => row.category === category))
      throw new Error(`Calibration category missing: ${category}`);
  return result.samples;
}

// Calibration CLI only. A received HTTP/model response is never retried to select a label.
export function shouldRetryVanguardCalibrationTransportFailure(
  failure: { status: number | null; errorName: string | null },
  completedAttempts: number,
) {
  return (
    completedAttempts > 0 &&
    completedAttempts < 3 &&
    failure.status === null &&
    (failure.errorName === "TypeError" || failure.errorName === "TimeoutError")
  );
}
