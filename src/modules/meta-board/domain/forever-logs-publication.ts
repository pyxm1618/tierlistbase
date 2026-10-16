import { z } from "zod";
import { WOW_DUNGEONS, WOW_ROLES } from "./wow-context";
const reviewSchema = z.object({
  phaseId: z.number().int().positive(),
  phaseName: z.string().min(1),
  levelCap: z.literal(30),
  officialSourceUrl: z.url().refine((url) => {
    const u = new URL(url);
    return (
      u.protocol === "https:" &&
      u.hostname === "us.forums.blizzard.com" &&
      u.pathname.includes("wow-forever")
    );
  }),
  checkedAt: z.iso.datetime(),
  taxonomySourceUrl: z.url().refine((url) => {
    const u = new URL(url);
    return u.protocol === "https:" && u.hostname === "foreverlogs.gg";
  }),
  dungeons: z
    .array(z.enum(WOW_DUNGEONS))
    .length(4)
    .refine((values) => new Set(values).size === 4),
  roleBySpec: z
    .record(z.string().min(3), z.array(z.enum(WOW_ROLES)).min(1))
    .refine((value) => Object.keys(value).length > 0),
  cohortSpecs: z.array(z.string().min(3)).optional(),
  officialSpecs: z.array(z.string().min(3)).optional(),
});
export type PublicationReview = z.infer<typeof reviewSchema>;

export const KNOWN_FOREVER_LOGS_COHORTS = ["Warrior::Gladiator", "Paladin::Justicar"] as const;

export function isSpecialCohortSpec(
  specKey: string,
  review?: {
    readonly cohortSpecs?: readonly string[] | undefined;
    readonly officialSpecs?: readonly string[] | undefined;
    readonly [key: string]: unknown;
  },
): boolean {
  if (review?.cohortSpecs && review.cohortSpecs.length > 0) {
    return review.cohortSpecs.includes(specKey);
  }
  return KNOWN_FOREVER_LOGS_COHORTS.includes(
    specKey as (typeof KNOWN_FOREVER_LOGS_COHORTS)[number],
  );
}
export function validatePublicationReview(
  value: unknown,
  context: { phaseId: number; phaseName: string; now: Date },
): PublicationReview {
  const review = reviewSchema.parse(value);
  const age = context.now.getTime() - new Date(review.checkedAt).getTime();
  if (age < 0 || age > 24 * 60 * 60 * 1000)
    throw new Error("Publication review must be checked within the last 24 hours");
  if (review.phaseId !== context.phaseId || review.phaseName !== context.phaseName)
    throw new Error("Publication blocked: active phase does not match reviewed Beta context");
  return review;
}
export function requireActivePhase(payload: unknown) {
  const response = z
    .object({
      phases: z.array(
        z.object({
          id: z.number().int().positive(),
          phase_number: z.number().int().positive(),
          name: z.string().min(1),
          is_active: z.boolean(),
          locations: z.array(z.object({ location: z.string() })).optional(),
        }),
      ),
    })
    .parse(payload);
  const active = response.phases.filter((phase) => phase.is_active);
  if (active.length !== 1)
    throw new Error(
      "Forever Logs must return exactly one active phase; no historical fallback is allowed",
    );
  return { ...active[0]!, id: active[0]!.phase_number };
}
