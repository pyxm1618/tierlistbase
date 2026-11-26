/**
 * Exports the archived (frozen) WoW Forever and Genshin Impact ranking snapshots from the
 * authoritative database into reviewable JSON artifacts.
 *
 * Why this exists: both archived tier lists still read PostgreSQL on every request, and each read
 * costs ~3.5s because the Worker must open a new Neon connection per request. Materializing the
 * frozen snapshot is the smallest change that removes that cost without touching the database, the
 * publishers, or the ranking rules.
 *
 * The database stays authoritative. This script is read-only and does not replace:
 *   - `scripts/update-wow-forever-data.ts` (WoW publisher)
 *   - `scripts/reviewed-editorial.ts` (Genshin reviewed-package importer)
 * Re-run it after any approved publish, then review and commit the regenerated artifact.
 *
 * Usage (needs a credential that can SELECT the ranking tables):
 *
 *   DATABASE_URL=... bun --conditions=react-server scripts/export-archived-ranking-snapshots.ts
 *
 * `--games=wow-forever` or `--games=genshin-impact` limits the export during triage.
 *
 * Output: `data/archived-snapshots/<game>.json` plus a manifest with counts and SHA-256 so a
 * reviewer can confirm the artifact matches what was exported.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadGenshinData } from "../src/modules/genshin-tier-list/data";
import { getGameMetaBoardData, getRecentRatingChanges } from "../src/modules/meta-board/db/queries";
import {
  createDatabaseClient,
  type DatabaseClient,
} from "../src/platform/database/client";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const OUTPUT_DIR = "data/archived-snapshots";
const WOW_ROLES = ["dps", "tank", "healer"] as const;
const GENSHIN_EDITORIAL_DIR = path.join(root, "data/editorial/genshin-impact/7.1");

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to export archived ranking snapshots");

const gamesArg = process.argv.find((argument) => argument.startsWith("--games="));
const requestedGames = new Set(
  (gamesArg?.slice("--games=".length) ?? "wow-forever,genshin-impact").split(",").filter(Boolean),
);
const databaseHost = new URL(databaseUrl).hostname;
const exportedAt = new Date().toISOString();

function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function writeArtifact(relativePath: string, value: unknown): Promise<string> {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, serialized, "utf8");
  const digest = createHash("sha256").update(serialized).digest("hex");
  console.log(`wrote ${relativePath} (${(Buffer.byteLength(serialized) / 1024).toFixed(1)} KiB)`);
  return digest;
}

async function readEditorial<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(GENSHIN_EDITORIAL_DIR, file), "utf8")) as T;
}

async function verifyEditorialChecksums(): Promise<number> {
  const checksums = await readEditorial<Record<string, string>>("checksums.json");
  for (const [file, expected] of Object.entries(checksums)) {
    const actual = createHash("sha256")
      .update(await readFile(path.join(GENSHIN_EDITORIAL_DIR, file)))
      .digest("hex");
    if (actual !== expected) {
      throw new Error(`Editorial package checksum mismatch for ${file}: ${actual} != ${expected}`);
    }
  }
  return Object.keys(checksums).length;
}

type EditorialCharacter = { slug: string; name: string };
type EditorialRating = { entitySlug: string; tier: string; primaryRole: string };

/** Proves the exported Genshin rows still equal the human-approved package that was imported. */
async function verifyGenshinAgainstEditorial(
  characters: readonly { name: string; tier: string; primaryRole: string }[],
): Promise<number> {
  const master = await readEditorial<EditorialCharacter[]>("character-master.json");
  const ratings = await readEditorial<EditorialRating[]>("ratings.json");
  const tierBySlug = new Map(ratings.map((rating) => [rating.entitySlug, rating]));
  const slugByName = new Map(master.map((character) => [character.name, character.slug]));

  if (characters.length !== master.length) {
    throw new Error(
      `Genshin export has ${characters.length} characters but the approved roster has ${master.length}`,
    );
  }
  for (const character of characters) {
    const slug = slugByName.get(character.name);
    if (!slug) throw new Error(`Exported character ${character.name} is not in the approved roster`);
    const approved = tierBySlug.get(slug);
    if (!approved) throw new Error(`Approved ratings have no entry for ${slug}`);
    if (character.tier !== approved.tier) {
      throw new Error(
        `Tier drift for ${character.name}: database "${character.tier}" vs approved "${approved.tier}"`,
      );
    }
    if (character.primaryRole !== approved.primaryRole) {
      throw new Error(
        `Role drift for ${character.name}: database "${character.primaryRole}" vs approved "${approved.primaryRole}"`,
      );
    }
  }
  return master.length;
}

async function exportWow(database: DatabaseClient) {
  const roles: Record<string, unknown> = {};
  let entities = 0;
  let evidenceSources = 0;
  let ratingChanges = 0;
  let version: string | null = null;
  let versionId: string | null = null;

  for (const role of WOW_ROLES) {
    const board = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "dungeon",
      role,
      levelCap: 30,
      db: database,
    });
    if (!board.hasData) throw new Error(`WoW ${role} board has no data; refusing to export`);
    if (board.tiers.length === 0) throw new Error(`WoW ${role} board has no tiers`);

    const changes =
      board.activeContext && board.version
        ? await getRecentRatingChanges("wow-forever", 10, database, {
            rankingContextId: board.activeContext.id,
            toVersionId: board.version.id,
          })
        : [];

    const items = board.tiers.flatMap((group) => group.items);
    entities += items.length;
    evidenceSources += items.reduce((total, item) => total + item.sources.length, 0);
    ratingChanges += changes.length;
    version = board.version?.version ?? version;
    versionId = board.version?.id ?? versionId;
    roles[role] = { board: jsonSafe(board), changes: jsonSafe(changes) };
    console.log(
      `WoW ${role}: ${items.length} entities, ${changes.length} changes, context ${board.activeContext?.id}`,
    );
  }

  return {
    schemaVersion: 1,
    provenance: {
      gameSlug: "wow-forever",
      exportedAt,
      databaseHost,
      version,
      versionId,
      roles: [...WOW_ROLES],
      counts: { entities, evidenceSources, ratingChanges },
    },
    roles,
  };
}

async function exportGenshin(database: Pick<DatabaseClient, "select">) {
  const result = await loadGenshinData(database);
  if (result.status !== "available") {
    throw new Error("Genshin snapshot is unavailable; refusing to export");
  }
  const { data } = result;
  if (data.characters.length === 0) throw new Error("Genshin snapshot has no characters");

  const approvedRoster = await verifyGenshinAgainstEditorial(data.characters);
  const checksummedFiles = await verifyEditorialChecksums();
  console.log(
    `Genshin ${data.version}: ${data.characters.length} characters, ${data.evidenceCount} evidence observations, ${data.sources.length} sources; matches approved roster (${approvedRoster}) across ${checksummedFiles} checksummed files`,
  );

  return {
    schemaVersion: 1,
    provenance: {
      gameSlug: "genshin-impact",
      exportedAt,
      databaseHost,
      version: data.version,
      editorialPackage: "data/editorial/genshin-impact/7.1",
      counts: { characters: data.characters.length, evidence: data.evidenceCount },
    },
    data: jsonSafe(data),
  };
}

const client = createDatabaseClient(databaseUrl, 1);
const manifest: Record<string, unknown> = { exportedAt, databaseHost, artifacts: {} };
const artifacts = manifest.artifacts as Record<string, { sha256: string }>;

try {
  if (requestedGames.has("wow-forever")) {
    const artifact = `${OUTPUT_DIR}/wow-forever.json`;
    artifacts[artifact] = { sha256: await writeArtifact(artifact, await exportWow(client.db)) };
  }
  if (requestedGames.has("genshin-impact")) {
    const artifact = `${OUTPUT_DIR}/genshin-impact.json`;
    artifacts[artifact] = {
      sha256: await writeArtifact(artifact, await exportGenshin(client.db)),
    };
  }
  await writeArtifact(`${OUTPUT_DIR}/manifest.json`, manifest);
  console.log(`exported from ${databaseHost} at ${exportedAt}`);
} finally {
  await client.close();
}
