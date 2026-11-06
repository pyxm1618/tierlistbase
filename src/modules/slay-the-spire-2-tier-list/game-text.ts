const RICH_TEXT_TAG =
  /\[\/?(?:gold|red|blue|green|purple|orange|pink|aqua|color|sine|jitter|b|i)\]/gi;
const PREFIXED_ENERGY = /(\d+)\[energy:\d+\]/gi;
const VALUE_TOKEN = /\[(energy|star):(\d+)\]/gi;
const UNKNOWN_TOKEN = /\[(\/?)([a-z][a-z0-9_-]*)(?::([^\]\r\n]+))?\]/gi;

export function formatSlayGameText(value: string): string {
  return value
    .replace(PREFIXED_ENERGY, (_match, amount: string) => `${amount} Energy`)
    .replace(VALUE_TOKEN, (_match, kind: string, amountText: string) => {
      const amount = Number.parseInt(amountText, 10);
      if (kind.toLowerCase() === "energy") return `${amount} Energy`;
      return `${amount} ${amount === 1 ? "Star" : "Stars"}`;
    })
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
