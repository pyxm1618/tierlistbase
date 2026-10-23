import path from "node:path";
import sharp from "sharp";

const monumentDir = path.join(process.cwd(), "public", "wow-forever", "vanguard", "monument");

const heroes = [
  ["vanguard-hero-base-desktop.png", "vanguard-hero-base-mobile.webp"],
  ["vanguard-forever-hero-base-desktop.png", "vanguard-forever-hero-base-mobile.webp"],
] as const;

await Promise.all(
  heroes.map(async ([source, output]) => {
    await sharp(path.join(monumentDir, source))
      .resize({ width: 780, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6, smartSubsample: true })
      .toFile(path.join(monumentDir, output));
  }),
);
