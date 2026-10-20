import { VanguardError } from "./event";
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
