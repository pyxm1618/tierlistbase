import { readdirSync, readFileSync, statSync } from "node:fs";
import path from "node:path";

import sharp from "sharp";
import { describe, expect, it } from "vitest";

const root = process.cwd();

describe("P1 image performance contracts", () => {
  it("keeps Limbus Identity and E.G.O production assets bounded WebP derivatives", async () => {
    const assetRoot = path.join(root, "src/modules/limbus-tier-list/assets");
    const manifest = JSON.parse(
      readFileSync(path.join(assetRoot, "asset-manifest.json"), "utf8"),
    ) as {
      entries: Record<
        "identities" | "ego",
        Array<{ file: string; width: number; height: number; bytes: number }>
      >;
    };

    for (const category of ["identities", "ego"] as const) {
      const dir = path.join(assetRoot, category);
      const files = readdirSync(dir).filter((file) => /\.(?:png|webp|avif)$/i.test(file));
      const entries = manifest.entries[category];

      expect(files).toHaveLength(entries.length);
      expect(files.every((file) => file.endsWith(".webp"))).toBe(true);
      expect(entries.every((entry) => entry.file.endsWith(".webp"))).toBe(true);

      let maxBytes = 0;
      for (const entry of entries) {
        const file = path.join(assetRoot, entry.file);
        const bytes = statSync(file).size;
        const metadata = await sharp(file).metadata();

        expect(metadata.format, entry.file).toBe("webp");
        expect(metadata.width, entry.file).toBeLessThanOrEqual(96);
        expect(metadata.height, entry.file).toBeLessThanOrEqual(96);
        expect(bytes, entry.file).toBeLessThanOrEqual(8_000);
        expect(entry.width, entry.file).toBe(metadata.width);
        expect(entry.height, entry.file).toBe(metadata.height);
        expect(entry.bytes, entry.file).toBe(bytes);
        maxBytes = Math.max(maxBytes, bytes);
      }

      expect(maxBytes).toBeLessThanOrEqual(8_000);
    }
  });

  it("optimizes Dragon portraits and detail while preserving direct Hero and tiny icons", () => {
    const source = readFileSync(
      path.join(root, "src/modules/dragon-traveler-tier-list/dragon-traveler-tier-list.tsx"),
      "utf8",
    );

    const portraitBlock = source.slice(
      source.indexOf("function Portrait"),
      source.indexOf("function CharacterDetail"),
    );
    expect(portraitBlock).toContain("width={size}");
    expect(portraitBlock).toContain("height={size}");
    expect(portraitBlock).not.toContain("unoptimized");

    const detailImage = source.match(
      /<Image[\s\S]*?className=\{styles\.detailPortrait\}[\s\S]*?\/>/,
    )?.[0];
    expect(detailImage).toBeDefined();
    expect(detailImage).toContain(
      'sizes="(max-width: 600px) 100vw, (max-width: 850px) 240px, 422px"',
    );
    expect(detailImage).not.toContain("unoptimized");

    const heroImage = source.match(/<Image[\s\S]*?className=\{styles\.heroArt\}[\s\S]*?\/>/)?.[0];
    expect(heroImage).toBeDefined();
    expect(heroImage).toContain("priority");
    expect(heroImage).toContain("unoptimized");

    const tinyDirect = source.match(/width=\{14\}[\s\S]{0,180}?unoptimized/g) ?? [];
    expect(tinyDirect).toHaveLength(2);
  });

  it("keeps Slay remote content responsive through Next Image with a narrow allowlist", () => {
    const source = readFileSync(
      path.join(root, "src/modules/slay-the-spire-2-tier-list/slay-the-spire-2-tier-list.tsx"),
      "utf8",
    );
    const nextConfig = readFileSync(path.join(root, "next.config.ts"), "utf8");
    const csp = readFileSync(
      path.join(root, "src/platform/security/content-security-policy.ts"),
      "utf8",
    );

    expect(source).toContain('import Image from "next/image"');
    expect(source).not.toMatch(/<img[^>]+src=\{(?:card|relic|character|potion)\.image\}/);
    expect(source).toContain(
      '<img className={styles.heroArt} src="/images/slay-the-spire-2/hero-spire.svg" alt="" />',
    );

    expect(source.match(/loading="lazy"/g)).toHaveLength(5);
    expect(source).toContain("width={250}");
    expect(source).toContain("height={172}");
    expect(source).toContain('sizes="(max-width: 620px) calc((100vw - 133px) / 2), 90px"');
    expect(source).toContain("width={96}");
    expect(source).toContain("height={130}");
    expect(source.match(/width=\{54\}/g)).toHaveLength(2);
    expect(source).toContain("width={86}");

    expect(nextConfig).toContain('hostname: "spire-codex.com"');
    expect(nextConfig).toContain('pathname: "/static/images/**"');
    expect(nextConfig.match(/hostname: "cdn\.spire-codex\.com"/g)).toHaveLength(4);
    for (const category of ["cards", "relics", "characters", "potions"]) {
      expect(nextConfig).toContain(`pathname: "/${category}/**"`);
    }

    expect(csp).toContain("https://spire-codex.com");
    expect(csp).toContain("https://cdn.spire-codex.com");
  });
});
