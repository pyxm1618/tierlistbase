import { z } from "zod";
import { WOW_CLASSES } from "@/modules/meta-board";
import { parseSeatId, VanguardError } from "./event";

const PROMOTION =
  /(?:https?:|www\.|\b[\p{L}\p{N}-]+\.(?:[a-z]{2,})(?:\b|\/)|[^\s@]+@[^\s@]+|discord\s*(?:\.|\/|invite)|(?:\+?\d[\d\s().-]{6,}\d))/iu;
const MARKUP = /[<>\p{Cc}\p{Cf}]|\*\*|__|`|!\[|\[[^\]]+\]\(|^\s{0,3}(?:#{1,6}\s|>\s|[-*+]\s)/u;
export function validateVanguardText(value: string, min: number, max: number): string {
  const normalized = value.normalize("NFKC").trim();
  const length = [...normalized].length;
  if (length < min || length > max || PROMOTION.test(normalized) || MARKUP.test(normalized))
    throw new VanguardError("INVALID_INPUT", 400);
  return normalized;
}
const text = (min: number, max: number) =>
  z
    .string()
    .max(max * 4 + 64)
    .transform((value, ctx) => {
      try {
        return validateVanguardText(value, min, max);
      } catch {
        ctx.addIssue({
          code: "custom",
          message: `Use plain text (${min}–${max} characters), without links or contact details.`,
        });
        return z.NEVER;
      }
    });
export const seatIdSchema = z
  .string()
  .max(24)
  .refine((value) => {
    try {
      parseSeatId(value);
      return true;
    } catch {
      return false;
    }
  }, "Invalid Seat ID");
export const holdSchema = z
  .object({
    seatId: seatIdSchema,
    holdToken: z
      .string()
      .regex(/^[A-Za-z0-9_-]{43}$/)
      .optional(),
  })
  .strict();
export const inscriptionSchema = z
  .object({
    seatId: seatIdSchema,
    holdToken: z.string().regex(/^[A-Za-z0-9_-]{43}$/),
    displayName: text(2, 32),
    faction: z.enum(["alliance", "horde"]),
    className: z.enum(WOW_CLASSES),
    guildName: text(0, 48).optional(),
    battleCry: text(0, 120).optional(),
    mediaId: z.uuid().optional(),
  })
  .strict();
export type InscriptionInput = z.infer<typeof inscriptionSchema>;
export const reportSchema = z
  .object({
    seatId: seatIdSchema,
    reason: z.enum(["sexual_graphic", "hate_impersonation", "privacy", "spam_promotion", "other"]),
  })
  .strict();
export const searchSchema = z.object({ q: text(2, 48) }).strict();
export function guildSearchKey(value: string): string {
  return value
    .normalize("NFKC")
    .trim()
    .toLocaleLowerCase("und")
    .replace(/ß/g, "ss")
    .replace(/ς/g, "σ");
}
