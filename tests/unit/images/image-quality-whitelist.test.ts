import { readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";

import { describe, expect, it } from "vitest";

import nextConfig from "../../../next.config";

const repositoryRoot = path.resolve(__dirname, "../../..");
const sourceRoot = path.join(repositoryRoot, "src");

function walk(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const absolute = path.join(directory, entry);
    return statSync(absolute).isDirectory()
      ? walk(absolute)
      : /\.(tsx|ts)$/.test(entry)
        ? [absolute]
        : [];
  });
}

type QualityUsage = { file: string; line: number; quality: number };

function collectQualityUsages(): QualityUsage[] {
  const usages: QualityUsage[] = [];
  for (const file of walk(sourceRoot)) {
    const contents = readFileSync(file, "utf8");
    if (!contents.includes("quality=")) continue;
    contents.split("\n").forEach((text, index) => {
      const match = /quality=\{(\d+)\}/.exec(text);
      if (match) {
        usages.push({
          file: path.relative(repositoryRoot, file),
          line: index + 1,
          quality: Number(match[1]),
        });
      }
    });
  }
  return usages;
}

/**
 * `next/image` rejects a `quality` that is not listed in `images.qualities` with HTTP 400, which
 * renders as a broken image with no visible error. The Genshin/Phantom Blade Zero heroes each
 * shipped a non-whitelisted value once, so the server configuration is the source of truth here.
 */
describe("next/image quality allow-list", () => {
  const allowed = nextConfig.images?.qualities;

  it("declares an explicit allow-list", () => {
    expect(allowed).toEqual([75, 85, 90]);
  });

  it("only uses qualities the image optimizer accepts", () => {
    const usages = collectQualityUsages();
    expect(usages.length).toBeGreaterThan(0);
    const offenders = usages.filter((usage) => !allowed?.includes(usage.quality));
    expect(
      offenders.map((usage) => `${usage.file}:${usage.line} quality={${usage.quality}}`),
    ).toEqual([]);
  });
});
