/**
 * Generates the narrow Wild Rift hero derivative used by the tier list page.
 *
 * The source artwork is 1440px wide but the hero slot renders around 760px on
 * desktop and full-bleed on phones, so the page previously always downloaded the
 * 1440px file. Run once and commit the output.
 *
 * Usage: bun scripts/generate-wild-rift-hero-derivatives.ts
 */
import path from "node:path";

import sharp from "sharp";

const heroDir = path.join(process.cwd(), "public", "images", "wild-rift");

await sharp(path.join(heroDir, "hero.webp"))
  .resize({ width: 760, withoutEnlargement: true })
  .webp({ quality: 78, effort: 6, smartSubsample: true })
  .toFile(path.join(heroDir, "hero-760.webp"));

console.log("Generated wild-rift hero-760.webp");
