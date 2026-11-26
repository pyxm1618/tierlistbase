import { createHash } from "node:crypto";
import { existsSync, readFileSync } from "node:fs";
import { readFile } from "node:fs/promises";
import path from "node:path";

/**
 * Binds a frozen ranking snapshot to the *reviewed editorial package of the same version*.
 *
 * The package directory is derived from the database version instead of being hard-coded, so a later
 * version can never be validated against an older package. Every failure mode here is fatal: an
 * unsafe version value, a missing package, a manifest for a different game/version/context, or a
 * checksum mismatch all refuse the export rather than producing a snapshot with weak provenance.
 */
export const GENSHIN_EDITORIAL_ROOT = "data/editorial/genshin-impact";

const VERSION_PATTERN = /^\d{1,3}(?:\.\d{1,3}){0,3}$/;
const PACKAGE_FILES = [
  "manifest.json",
  "checksums.json",
  "character-master.json",
  "ratings.json",
  "sources.json",
  "evidence.json",
] as const;

export type EditorialManifest = {
  readonly game: string;
  readonly gameVersion: string;
  readonly rankingContext: string;
  readonly reviewStatus: string;
  readonly characterCount: number;
  readonly ratingCount: number;
  readonly evidenceCount: number;
};

export type ResolvedEditorialPackage = {
  readonly version: string;
  /** Repository-relative path recorded in the snapshot provenance. */
  readonly relativePath: string;
  readonly directory: string;
  readonly manifest: EditorialManifest;
};

/**
 * Rejects anything that could escape the editorial root or be interpreted as a path fragment.
 * Version values come from the database, so they are treated as untrusted input.
 */
export function assertSafeVersion(version: string): string {
  if (typeof version !== "string" || !VERSION_PATTERN.test(version)) {
    throw new Error(
      `Refusing to export: Genshin version ${JSON.stringify(version)} is not a safe path segment`,
    );
  }
  return version;
}

function assertInsideRoot(root: string, candidate: string, version: string): void {
  const normalizedRoot = path.resolve(root);
  const normalizedCandidate = path.resolve(candidate);
  if (
    normalizedCandidate !== normalizedRoot &&
    !normalizedCandidate.startsWith(`${normalizedRoot}${path.sep}`)
  ) {
    throw new Error(`Refusing to export: editorial path for version "${version}" escapes the root`);
  }
}

export function resolveEditorialPackage(options: {
  readonly version: string;
  /** Database ranking context, e.g. `endgame-overall`; must match the package manifest. */
  readonly rankingContext?: string | undefined;
  readonly rootDir?: string | undefined;
}): ResolvedEditorialPackage {
  const version = assertSafeVersion(options.version);
  const rootDir = options.rootDir ?? process.cwd();
  const root = path.join(rootDir, GENSHIN_EDITORIAL_ROOT);
  const directory = path.join(root, version);
  assertInsideRoot(root, directory, version);

  for (const file of PACKAGE_FILES) {
    if (!existsSync(path.join(directory, file))) {
      throw new Error(
        `Refusing to export: no reviewed editorial package for Genshin ${version} (missing ${file})`,
      );
    }
  }

  // Read synchronously: this runs once at startup, before any database work.
  const manifest = JSON.parse(
    readFileSync(path.join(directory, "manifest.json"), "utf8"),
  ) as EditorialManifest;

  if (manifest.game !== "genshin-impact") {
    throw new Error(
      `Refusing to export: editorial package ${version} is for game "${manifest.game}", not genshin-impact`,
    );
  }
  if (manifest.gameVersion !== version) {
    throw new Error(
      `Refusing to export: editorial package ${version} declares version "${manifest.gameVersion}"`,
    );
  }
  if (options.rankingContext !== undefined && manifest.rankingContext !== options.rankingContext) {
    throw new Error(
      `Refusing to export: editorial package ${version} covers context "${manifest.rankingContext}", database says "${options.rankingContext}"`,
    );
  }
  if (manifest.reviewStatus !== "approved") {
    throw new Error(
      `Refusing to export: editorial package ${version} is "${manifest.reviewStatus}", not approved`,
    );
  }

  return {
    version,
    relativePath: `${GENSHIN_EDITORIAL_ROOT}/${version}`,
    directory,
    manifest,
  };
}

export async function readPackageFile<T>(pkg: ResolvedEditorialPackage, file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(pkg.directory, file), "utf8")) as T;
}

/** Re-hashes every file listed in `checksums.json`; returns how many were verified. */
export async function verifyEditorialChecksums(pkg: ResolvedEditorialPackage): Promise<number> {
  const checksums = await readPackageFile<Record<string, string>>(pkg, "checksums.json");
  for (const [file, expected] of Object.entries(checksums)) {
    const actual = createHash("sha256")
      .update(await readFile(path.join(pkg.directory, file)))
      .digest("hex");
    if (actual !== expected) {
      throw new Error(
        `Refusing to export: editorial checksum mismatch for ${pkg.relativePath}/${file} (${actual} != ${expected})`,
      );
    }
  }
  return Object.keys(checksums).length;
}

type EditorialCharacter = { slug: string; name: string };
type EditorialRating = { entitySlug: string; tier: string; primaryRole: string };

/**
 * Proves the exported rows still equal the human-approved package: same roster size, and an exact
 * tier/role match for every character.
 */
export async function verifyGenshinAgainstEditorial(
  pkg: ResolvedEditorialPackage,
  characters: readonly { name: string; tier: string; primaryRole: string }[],
): Promise<number> {
  const master = await readPackageFile<EditorialCharacter[]>(pkg, "character-master.json");
  const ratings = await readPackageFile<EditorialRating[]>(pkg, "ratings.json");
  const tierBySlug = new Map(ratings.map((rating) => [rating.entitySlug, rating]));
  const slugByName = new Map(master.map((character) => [character.name, character.slug]));

  if (characters.length !== master.length) {
    throw new Error(
      `Refusing to export: Genshin has ${characters.length} characters but the approved ${pkg.version} roster has ${master.length}`,
    );
  }
  for (const character of characters) {
    const slug = slugByName.get(character.name);
    if (!slug) {
      throw new Error(
        `Refusing to export: character ${character.name} is not in the approved ${pkg.version} roster`,
      );
    }
    const approved = tierBySlug.get(slug);
    if (!approved) {
      throw new Error(`Refusing to export: approved ratings have no entry for ${slug}`);
    }
    if (character.tier !== approved.tier) {
      throw new Error(
        `Refusing to export: tier drift for ${character.name}: database "${character.tier}" vs approved "${approved.tier}"`,
      );
    }
    if (character.primaryRole !== approved.primaryRole) {
      throw new Error(
        `Refusing to export: role drift for ${character.name}: database "${character.primaryRole}" vs approved "${approved.primaryRole}"`,
      );
    }
  }
  return master.length;
}
