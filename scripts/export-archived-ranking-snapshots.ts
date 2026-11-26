/**
 * Exports the archived (frozen) WoW Forever and Genshin Impact ranking snapshots from the
 * authoritative database into committed, reviewable JSON artifacts.
 *
 * Why this exists: both archived tier lists read PostgreSQL on every request, and each read costs
 * ~3.5s because the Worker has to open a new Neon connection per request. Materializing the frozen
 * snapshot is the smallest change that removes that cost without touching the database, the
 * publishers, or the ranking rules.
 *
 * The database stays authoritative. This script is strictly read-only and does not replace:
 *   - `scripts/update-wow-forever-data.ts` (WoW publisher)
 *   - `scripts/reviewed-editorial.ts` (Genshin reviewed-package importer)
 * Re-run it after any approved publish, review the JSON diff, and commit the result.
 *
 * Credential handling: the connection string is read from `DATABASE_URL`, or from a file so it never
 * appears in argv, shell history, or logs:
 *
 *   bun --conditions=react-server scripts/export-archived-ranking-snapshots.ts \
 *     --database-url-file=/absolute/path/to/.env.local
 *
 * `--games=wow-forever` or `--games=genshin-impact` limits the export during triage.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadGenshinData } from "../src/modules/genshin-tier-list/data";
import { getGameMetaBoardData, getRecentRatingChanges } from "../src/modules/meta-board/db/queries";
import { createDatabaseClient, type DatabaseClient } from "../src/platform/database/client";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WOW_ROLES = ["dps", "tank", "healer"] as const;
const WOW_OUTPUT = "src/modules/meta-board/db/archived-snapshots/wow-forever.json";
const GENSHIN_OUTPUT = "src/modules/genshin-tier-list/archived-snapshots/genshin-impact.json";
const GENSHIN_EDITORIAL_DIR = path.join(root, "data/editorial/genshin-impact/7.1");

function resolveDatabaseUrl(): string {
  const direct = process.env.DATABASE_URL;
  if (direct) return direct;
  const fileArgument = process.argv.find((argument) => argument.startsWith("--database-url-file="));
  if (!fileArgument) {
    throw new Error(
      "Provide DATABASE_URL or --database-url-file=<path>; the credential needs SELECT on the ranking tables",
    );
  }
  const contents = readFileSync(fileArgument.slice("--database-url-file=".length), "utf8");
  const line = contents.split("\n").find((entry) => entry.startsWith("DATABASE_URL="));
  if (!line) throw new Error("The given file has no DATABASE_URL entry");
  return line
    .slice("DATABASE_URL=".length)
    .trim()
    .replace(/^["']|["']$/g, "");
}

const databaseUrl = resolveDatabaseUrl();
const gamesArgument = process.argv.find((argument) => argument.startsWith("--games="));
const requestedGames = new Set(
  (gamesArgument?.slice("--games=".length) ?? "wow-forever,genshin-impact")
    .split(",")
    .filter(Boolean),
);
// Never persist the endpoint or credential in a committed artifact; the region is enough to explain
// the latency this snapshot removes.
const databaseTarget = `neon:${/\.([a-z]{2}-[a-z]+-\d+)\./.exec(new URL(databaseUrl).hostname)?.[1] ?? "unknown"}`;
const exportedAt = new Date().toISOString();

function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function writeArtifact(relativePath: string, value: unknown): Promise<string> {
  const serialized = `${JSON.stringify(value, null, 2)}\n`;
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, serialized, "utf8");
  console.log(`wrote ${relativePath} (${(Buffer.byteLength(serialized) / 1024).toFixed(1)} KiB)`);
  return createHash("sha256").update(serialized).digest("hex");
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
    if (!slug)
      throw new Error(`Exported character ${character.name} is not in the approved roster`);
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

async function buildWowSnapshot(database: DatabaseClient) {
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
      databaseTarget,
      version,
      versionId,
      roles: [...WOW_ROLES],
      counts: { entities, evidenceSources, ratingChanges },
    },
    roles,
  };
}

async function buildGenshinSnapshot(database: Pick<DatabaseClient, "select">) {
  const result = await loadGenshinData(database);
  if (result.status !== "available") {
    throw new Error("Genshin snapshot is unavailable; refusing to export");
  }
  const { data } = result;
  if (data.characters.length === 0) throw new Error("Genshin snapshot has no characters");

  const approvedRoster = await verifyGenshinAgainstEditorial(data.characters);
  const checksummedFiles = await verifyEditorialChecksums();
  console.log(
    `Genshin ${data.version}: ${data.characters.length} characters, ${data.evidenceCount} evidence observations, ${data.sources.length} sources; matches the approved roster (${approvedRoster}) across ${checksummedFiles} checksummed files`,
  );

  return {
    schemaVersion: 1,
    provenance: {
      gameSlug: "genshin-impact",
      exportedAt,
      databaseTarget,
      version: data.version,
      editorialPackage: "data/editorial/genshin-impact/7.1",
      counts: { characters: data.characters.length, evidence: data.evidenceCount },
    },
    data: jsonSafe(data),
  };
}

const client = createDatabaseClient(databaseUrl, 1);
try {
  if (requestedGames.has("wow-forever")) {
    const digest = await writeArtifact(WOW_OUTPUT, await buildWowSnapshot(client.db));
    console.log(`wow-forever sha256 ${digest}`);
  }
  if (requestedGames.has("genshin-impact")) {
    const digest = await writeArtifact(GENSHIN_OUTPUT, await buildGenshinSnapshot(client.db));
    console.log(`genshin-impact sha256 ${digest}`);
  }
  console.log(`exported from ${databaseTarget} at ${exportedAt}`);
} finally {
  await client.close();
}
