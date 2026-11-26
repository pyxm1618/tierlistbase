import { createHash } from "node:crypto";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

import { afterEach, describe, expect, it } from "vitest";

import {
  assertSafeVersion,
  resolveEditorialPackage,
  verifyEditorialChecksums,
  verifyGenshinAgainstEditorial,
} from "../../../src/modules/genshin-tier-list/editorial-package";

const roots: string[] = [];

function temporaryRoot(): string {
  const root = mkdtempSync(path.join(tmpdir(), "editorial-package-"));
  roots.push(root);
  return root;
}

afterEach(() => {
  for (const root of roots.splice(0)) rmSync(root, { recursive: true, force: true });
});

type PackageOptions = {
  readonly root: string;
  readonly directoryVersion: string;
  readonly manifestVersion?: string;
  readonly game?: string;
  readonly rankingContext?: string;
  readonly reviewStatus?: string;
  readonly checksumOverride?: Record<string, string>;
};

function writePackage(options: PackageOptions): string {
  const directory = path.join(
    options.root,
    "data/editorial/genshin-impact",
    options.directoryVersion,
  );
  mkdirSync(directory, { recursive: true });

  const files: Record<string, string> = {
    "manifest.json": JSON.stringify({
      game: options.game ?? "genshin-impact",
      gameVersion: options.manifestVersion ?? options.directoryVersion,
      rankingContext: options.rankingContext ?? "endgame-overall",
      reviewStatus: options.reviewStatus ?? "approved",
      characterCount: 2,
      ratingCount: 2,
      evidenceCount: 2,
    }),
    "character-master.json": JSON.stringify([
      { slug: "aino", name: "Aino" },
      { slug: "vesna", name: "Vesna" },
    ]),
    "ratings.json": JSON.stringify([
      { entitySlug: "aino", tier: "B+", primaryRole: "Support" },
      { entitySlug: "vesna", tier: "A+", primaryRole: "Main DPS" },
    ]),
    "sources.json": JSON.stringify([]),
    "evidence.json": JSON.stringify([]),
  };

  const checksums = Object.fromEntries(
    Object.entries(files).map(([file, contents]) => [
      file,
      createHash("sha256").update(contents).digest("hex"),
    ]),
  );
  files["checksums.json"] = JSON.stringify({ ...checksums, ...options.checksumOverride });

  for (const [file, contents] of Object.entries(files)) {
    writeFileSync(path.join(directory, file), contents, "utf8");
  }
  return directory;
}

describe("Genshin editorial package version binding", () => {
  it("binds the repository's approved package to the database version", async () => {
    const pkg = resolveEditorialPackage({ version: "7.1", rankingContext: "endgame-overall" });
    expect(pkg.relativePath).toBe("data/editorial/genshin-impact/7.1");
    expect(pkg.manifest.gameVersion).toBe("7.1");
    expect(pkg.manifest.rankingContext).toBe("endgame-overall");
    expect(await verifyEditorialChecksums(pkg)).toBe(5);
  });

  it("refuses a version that has no reviewed package instead of reusing an older one", () => {
    expect(() =>
      resolveEditorialPackage({ version: "7.2", rankingContext: "endgame-overall" }),
    ).toThrow(/no reviewed editorial package for Genshin 7\.2/);
  });

  it("refuses a package whose manifest declares another version", () => {
    const root = temporaryRoot();
    writePackage({ root, directoryVersion: "9.9", manifestVersion: "7.1" });
    expect(() => resolveEditorialPackage({ version: "9.9", rootDir: root })).toThrow(
      /declares version "7\.1"/,
    );
  });

  it("refuses a package for another game or ranking context", () => {
    const root = temporaryRoot();
    writePackage({ root, directoryVersion: "9.9", game: "wow-forever" });
    expect(() => resolveEditorialPackage({ version: "9.9", rootDir: root })).toThrow(
      /not genshin-impact/,
    );

    const second = temporaryRoot();
    writePackage({ root: second, directoryVersion: "9.9", rankingContext: "abyss-only" });
    expect(() =>
      resolveEditorialPackage({
        version: "9.9",
        rankingContext: "endgame-overall",
        rootDir: second,
      }),
    ).toThrow(/covers context "abyss-only"/);
  });

  it("refuses a package that is not approved", () => {
    const root = temporaryRoot();
    writePackage({ root, directoryVersion: "9.9", reviewStatus: "draft" });
    expect(() => resolveEditorialPackage({ version: "9.9", rootDir: root })).toThrow(
      /is "draft", not approved/,
    );
  });

  it("rejects version values that could escape the editorial root", () => {
    for (const version of ["../7.1", "7.1/../8.0", "7.1/8.0", "7,1", "", "v7.1", "7.1 "]) {
      expect(() => assertSafeVersion(version), version).toThrow(/not a safe path segment/);
    }
    expect(assertSafeVersion("7.1")).toBe("7.1");
    expect(assertSafeVersion("10")).toBe("10");
  });

  it("refuses an export when a checksum no longer matches", async () => {
    const root = temporaryRoot();
    writePackage({
      root,
      directoryVersion: "9.9",
      checksumOverride: { "ratings.json": "0".repeat(64) },
    });
    const pkg = resolveEditorialPackage({ version: "9.9", rootDir: root });
    await expect(verifyEditorialChecksums(pkg)).rejects.toThrow(
      /checksum mismatch for data\/editorial\/genshin-impact\/9\.9\/ratings\.json/,
    );
  });

  it("refuses an export whose roster no longer matches the approved package", async () => {
    const root = temporaryRoot();
    writePackage({ root, directoryVersion: "9.9" });
    const pkg = resolveEditorialPackage({ version: "9.9", rootDir: root });

    await expect(
      verifyGenshinAgainstEditorial(pkg, [
        { name: "Aino", tier: "A", primaryRole: "Support" },
        { name: "Vesna", tier: "A+", primaryRole: "Main DPS" },
      ]),
    ).rejects.toThrow(/tier drift for Aino/);

    await expect(
      verifyGenshinAgainstEditorial(pkg, [{ name: "Aino", tier: "B+", primaryRole: "Support" }]),
    ).rejects.toThrow(/approved 9\.9 roster has 2/);

    await expect(
      verifyGenshinAgainstEditorial(pkg, [
        { name: "Aino", tier: "B+", primaryRole: "Support" },
        { name: "Vodyanitsa", tier: "S", primaryRole: "Support" },
      ]),
    ).rejects.toThrow(/not in the approved 9\.9 roster/);

    await expect(
      verifyGenshinAgainstEditorial(pkg, [
        { name: "Aino", tier: "B+", primaryRole: "Support" },
        { name: "Vesna", tier: "A+", primaryRole: "Burst DPS" },
      ]),
    ).rejects.toThrow(/role drift for Vesna/);
  });
});
