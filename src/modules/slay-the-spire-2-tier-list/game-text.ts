const RICH_TEXT_TAG =
  /\[\/?(?:gold|red|blue|green|purple|orange|pink|aqua|color|sine|jitter|b|i)\]/gi;
const FORMATTED_PREFIXED_RESOURCE = /\[[a-z]+\](\d+)\[\/[a-z]+\]\s*\[(energy|star):\d+\]/gi;
const PREFIXED_RESOURCE = /(\d+)\s*\[(energy|star):\d+\]/gi;
const VALUE_TOKEN = /\[(energy|star):(\d+)\]/gi;
const UNKNOWN_TOKEN = /\[(\/?)([a-z][a-z0-9_-]*)(?::([^\]\r\n]+))?\]/gi;

function formatResource(kind: string, amountText: string): string {
  const amount = Number.parseInt(amountText, 10);
  if (kind.toLowerCase() === "energy") return `${amount} Energy`;
  return `${amount} ${amount === 1 ? "Star" : "Stars"}`;
}

function replacePrefixedResource(_match: string, amountText: string, kind: string): string {
  return formatResource(kind, amountText);
}

function replaceValueToken(_match: string, kind: string, amountText: string): string {
  return formatResource(kind, amountText);
}

function replaceUnknownToken(
  _match: string,
  closing: string,
  name: string,
  argument: string | undefined,
): string {
  if (closing) return "";
  return argument ?? name;
}

export function formatSlayGameText(value: string): string {
  return value
    .replace(FORMATTED_PREFIXED_RESOURCE, replacePrefixedResource)
    .replace(PREFIXED_RESOURCE, replacePrefixedResource)
    .replace(VALUE_TOKEN, replaceValueToken)
    .replace(RICH_TEXT_TAG, "")
    .replace(UNKNOWN_TOKEN, replaceUnknownToken)
    .replace(/[ \t]+([,.;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
