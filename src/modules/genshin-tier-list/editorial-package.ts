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
/** The reviewed package is complete only if every one of these files is checksummed. */
export const REQUIRED_CHECKSUMMED_FILES = [
  "character-master.json",
  "ratings.json",
  "sources.json",
  "evidence.json",
  "manifest.json",
] as const;

const SHA256_HEX = /^[a-fA-F0-9]{64}$/;
const SAFE_FILE_NAME = /^[A-Za-z0-9][A-Za-z0-9._-]*$/;

/** Rejects anything that is not a plain file name inside the package directory. */
export function assertPackageFileName(file: string): string {
  if (!SAFE_FILE_NAME.test(file) || file.includes("..")) {
    throw new Error(
      `Refusing to export: unsafe file name ${JSON.stringify(file)} in checksums.json`,
    );
  }
  return file;
}

/**
 * Re-hashes every file the package declares, and refuses a manifest that is not exactly the five
 * reviewed inputs: a subset would silently leave an input unverified, and an extra entry would let
 * an unreviewed file claim to be part of the package.
 */
export async function verifyEditorialChecksums(pkg: ResolvedEditorialPackage): Promise<number> {
  const checksums = await readPackageFile<Record<string, unknown>>(pkg, "checksums.json");
  if (checksums === null || typeof checksums !== "object" || Array.isArray(checksums)) {
    throw new Error(`Refusing to export: ${pkg.relativePath}/checksums.json is not an object`);
  }

  const declared = Object.keys(checksums);
  if (declared.length === 0) {
    throw new Error(`Refusing to export: ${pkg.relativePath}/checksums.json is empty`);
  }

  const required = new Set<string>(REQUIRED_CHECKSUMMED_FILES);
  const missing = [...required].filter((file) => !Object.hasOwn(checksums, file));
  if (missing.length > 0) {
    throw new Error(
      `Refusing to export: ${pkg.relativePath}/checksums.json does not checksum ${missing.join(", ")}`,
    );
  }
  const unexpected = declared.filter((file) => !required.has(file));
  if (unexpected.length > 0) {
    throw new Error(
      `Refusing to export: ${pkg.relativePath}/checksums.json lists unexpected ${unexpected.join(", ")}`,
    );
  }
  if (declared.length !== REQUIRED_CHECKSUMMED_FILES.length) {
    throw new Error(
      `Refusing to export: ${pkg.relativePath}/checksums.json must list exactly ${REQUIRED_CHECKSUMMED_FILES.length} files, found ${declared.length}`,
    );
  }

  for (const file of REQUIRED_CHECKSUMMED_FILES) {
    assertPackageFileName(file);
    const expected = checksums[file];
    if (typeof expected !== "string" || !SHA256_HEX.test(expected)) {
      throw new Error(
        `Refusing to export: ${pkg.relativePath}/checksums.json has an invalid SHA-256 for ${file}`,
      );
    }
    const absolute = path.join(pkg.directory, file);
    if (!absolute.startsWith(`${pkg.directory}${path.sep}`)) {
      throw new Error(`Refusing to export: resolved path for ${file} escapes the package`);
    }
    if (!existsSync(absolute)) {
      throw new Error(`Refusing to export: ${pkg.relativePath}/${file} is missing`);
    }
    const actual = createHash("sha256")
      .update(await readFile(absolute))
      .digest("hex");
    if (actual !== expected.toLowerCase()) {
      throw new Error(
        `Refusing to export: editorial checksum mismatch for ${pkg.relativePath}/${file} (${actual} != ${expected})`,
      );
    }
  }

  return REQUIRED_CHECKSUMMED_FILES.length;
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
