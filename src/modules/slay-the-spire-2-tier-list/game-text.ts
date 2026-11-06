const RICH_TEXT_TAG =
  /\[\/?(?:gold|red|blue|green|purple|orange|pink|aqua|color|sine|jitter|b|i)\]/gi;
const FORMATTED_PREFIXED_RESOURCE = /\[[a-z]+\](\d+)\[\/[a-z]+\]\s*\[(energy|star):\d+\]/gi;
const PREFIXED_RESOURCE = /(\d+)\s*\[(energy|star):\d+\]/gi;
const VALUE_TOKEN = /\[(energy|star):(\d+)\]/gi;
const UNKNOWN_TOKEN = /\[(\/?)([a-z][a-z0-9_-]*)(?::([^\]\r\n]+))?\]/gi;

export function formatSlayGameText(value: string): string {
  const formatResource = (kind: string, amountText: string) => {
    const amount = Number.parseInt(amountText, 10);
    if (kind.toLowerCase() === "energy") return `${amount} Energy`;
    return `${amount} ${amount === 1 ? "Star" : "Stars"}`;
  };

  return value
    .replace(
      FORMATTED_PREFIXED_RESOURCE,
      (_match, amountText: string, kind: string) => formatResource(kind, amountText),
    )
    .replace(PREFIXED_RESOURCE, (_match, amountText: string, kind: string) =>
      formatResource(kind, amountText),
    )
    .replace(VALUE_TOKEN, (_match, kind: string, amountText: string) =>
      formatResource(kind, amountText),
    )
    .replace(RICH_TEXT_TAG, "")
    .replace(
      UNKNOWN_TOKEN,
      (_match, closing: string, name: string, argument: string | undefined) => {
        if (closing) return "";
        return argument ?? name;
      },
    )
    .replace(/[ \t]+([,.;:!?])/g, "$1")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
