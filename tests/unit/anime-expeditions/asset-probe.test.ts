import { createHash } from "node:crypto";

import sharp from "sharp";
import { expect, it } from "vitest";

const assets = [
  ["unit-reaper-frenzied", "Reaper (Frenzied).png", 384, 368],
  ["unit-wolf-revived", "Wolf (Revived).png", 384, 368],
  ["unit-black-heart-revived", "Black Heart (Revived).png", 384, 368],
  ["unit-noble-captain-vibrant", "Noble Captain (Vibrant).png", 384, 368],
  ["unit-traitor-illusion", "Traitor (Illusion).png", 384, 368],
  ["unit-emerald-fist", "Emerald Fist.png", 384, 368],
  ["unit-impaler-ultimate", "Impaler (Ultimate).png", 384, 368],
  ["unit-atom-totality", "Atom (Totality).png", 384, 368],
  ["unit-dead-melody-solo", "Dead Melody (Solo).png", 384, 368],
  ["unit-first-blade-strongest", "First Blade (Strongest).png", 384, 368],
  ["unit-princess-misery", "Princess (Misery).png", 384, 368],
  ["gear-piety-obliteration", "Piety & Obliteration Equipment.png", 192, 192],
  ["gear-morphing-sword", "Morphing Sword Equipment.png", 192, 192],
  ["gear-kings-guitar", "King's Guitar Equipment.png", 192, 192],
  ["gear-life-eater", "Life Eater Equipment.png", 192, 192],
  ["gear-evening-umbrella", "Evening Umbrella Equipment.png", 192, 192],
  ["gear-onis-nature", "Oni's Nature Equipment.png", 192, 192],
] as const;

function sourceUrl(filename: string) {
  const normalized = filename.replaceAll(" ", "_");
  const digest = createHash("md5").update(normalized).digest("hex");
  const encoded = normalized
    .replaceAll("%", "%25")
    .replaceAll("&", "%26")
    .replaceAll("'", "%27")
    .replaceAll("(", "%28")
    .replaceAll(")", "%29");
  return `https://static.wikitide.net/animeexpeditionswiki/${digest[0]}/${digest.slice(0, 2)}/${encoded}`;
}

it(
  "probes missing Anime Expeditions source media for the final closeout",
  async () => {
    const failures: string[] = [];

    for (const [key, filename, width, height] of assets) {
      const url = sourceUrl(filename);
      try {
        const response = await fetch(url);
        if (!response.ok) {
          failures.push(`${key}: HTTP ${response.status} ${url}`);
          continue;
        }
        const source = Buffer.from(await response.arrayBuffer());
        const metadata = await sharp(source).metadata();
        const derivative = await sharp(source)
          .resize(width, height)
          .webp({ quality: 80 })
          .toBuffer();

        process.stdout.write(
          `ANIME_ASSET ${JSON.stringify({
            key,
            filename,
            url,
            sourceWidth: metadata.width,
            sourceHeight: metadata.height,
            width,
            height,
            bytes: derivative.length,
            base64: derivative.toString("base64"),
          })}\n`,
        );
      } catch (error) {
        failures.push(`${key}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }

    for (const failure of failures) process.stdout.write(`ANIME_ASSET_ERROR ${failure}\n`);
    expect(failures).toEqual([]);
  },
  120_000,
);
