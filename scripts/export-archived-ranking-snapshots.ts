/**
 * Exports the archived (frozen) WoW Forever and Genshin Impact ranking snapshots.
 *
 * The database stays authoritative and keeps its existing publisher (`scripts/update-wow-forever-data.ts`)
 * and importer (`scripts/reviewed-editorial.ts`). This script only materializes what those tools
 * produced so the public pages can serve a frozen snapshot without a per-request database read.
 *
 * Usage (requires the real DATABASE_URL, same secret the production deploy uses):
 *
 *   bun --conditions=react-server scripts/export-archived-ranking-snapshots.ts
 *
 * It refuses to write when the exported data is incomplete or when the Genshin export disagrees
 * with the human-approved editorial package in `data/editorial/`.
 */
import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { loadGenshinData } from "../src/modules/genshin-tier-list/data";
import { getGameMetaBoardData, getRecentRatingChanges } from "../src/modules/meta-board/db/queries";
import { createDatabaseClient, type DatabaseClient } from "../src/platform/database/client";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) throw new Error("DATABASE_URL is required to export archived ranking snapshots");

const databaseHost = new URL(databaseUrl).hostname;
const exportedAt = new Date().toISOString();
const WOW_ROLES = ["dps", "tank", "healer"] as const;
const GENSHIN_EDITORIAL_DIR = path.join(root, "data/editorial/genshin-impact/7.1");

function jsonSafe<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

async function writeJson(relativePath: string, value: unknown) {
  const target = path.join(root, relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await writeFile(target, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  const bytes = Buffer.byteLength(`${JSON.stringify(value, null, 2)}\n`);
  console.log(`wrote ${relativePath} (${(bytes / 1024).toFixed(1)} KiB)`);
}

async function readEditorial<T>(file: string): Promise<T> {
  return JSON.parse(await readFile(path.join(GENSHIN_EDITORIAL_DIR, file), "utf8")) as T;
}

async function verifyEditorialChecksums() {
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

async function verifyGenshinAgainstEditorial(
  characters: readonly { name: string; tier: string; primaryRole: string }[],
) {
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
  let entityCount = 0;
  let evidenceCount = 0;
  let changeCount = 0;
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
    entityCount += items.length;
    evidenceCount += items.reduce((total, item) => total + item.sources.length, 0);
    changeCount += changes.length;
    version = board.version?.version ?? version;
    versionId = board.version?.id ?? versionId;

    roles[role] = { board: jsonSafe(board), changes: jsonSafe(changes) };
    console.log(
      `WoW ${role}: ${items.length} entities, ${changes.length} changes, context ${board.activeContext?.id}`,
    );
  }

  return {
    snapshot: {
      schemaVersion: 1,
      provenance: {
        gameSlug: "wow-forever",
        exportedAt,
        databaseHost,
        version,
        versionId,
        roles: [...WOW_ROLES],
        quota: { entities: entityCount, evidenceSources: evidenceCount, ratingChanges: changeCount },
      },
      roles,
    },
    counts: { entityCount, evidenceCount, changeCount },
  };
}

async function exportGenshin(database: Pick<DatabaseClient, "select">) {
  const result = await loadGenshinData(database);
  if (result.status !== "available") throw new Error("Genshin snapshot is unavailable; refusing to export");
  const { data } = result;
  if (data.characters.length === 0) throw new Error("Genshin snapshot has no characters");

  const approvedRoster = await verifyGenshinAgainstEditorial(data.characters);
  const checksummedFiles = await verifyEditorialChecksums();
  console.log(
    `Genshin ${data.version}: ${data.characters.length} characters, ${data.evidenceCount} evidence observations, ${data.sources.length} sources`,
  );
  console.log(
    `Genshin cross-check: matches approved roster (${approvedRoster}) and ${checksummedFiles} checksummed editorial files`,
  );

  return {
    snapshot: {
      schemaVersion: 1,
      provenance: {
        gameSlug: "genshin-impact",
        exportedAt,
        databaseHost,
        version: data.version,
        editorialPackage: "data/editorial/genshin-impact/7.1",
      },
      data: jsonSafe(data),
    },
    counts: { characters: data.characters.length, evidence: data.evidenceCount },
  };
}

const client = createDatabaseClient(databaseUrl, 1);
try {
  const wow = await exportWow(client.db);
  await writeJson("src/modules/meta-board/db/archived-snapshots/wow-forever.json", wow.snapshot);
  await writeFile(
    path.join(root, "src/modules/meta-board/db/archived-snapshots/registry.ts"),
    `import type { ArchivedMetaBoardSnapshot } from "../archived-snapshot";\nimport wowForever from "./wow-forever.json";\n\n/** Generated by \`scripts/export-archived-ranking-snapshots.ts\`. Do not edit by hand. */\nexport const archivedMetaBoardSnapshots: Record<string, ArchivedMetaBoardSnapshot> = {\n  "wow-forever": wowForever as unknown as ArchivedMetaBoardSnapshot,\n};\n`,
    "utf8",
  );

  const genshin = await exportGenshin(client.db);
  await writeJson(
    "src/modules/genshin-tier-list/archived-snapshots/genshin-impact.json",
    genshin.snapshot,
  );
  await writeFile(
    path.join(root, "src/modules/genshin-tier-list/archived-snapshots/registry.ts"),
    `import type { GenshinArchivedSnapshot } from "../archived-snapshot";\nimport genshinImpact from "./genshin-impact.json";\n\n/** Generated by \`scripts/export-archived-ranking-snapshots.ts\`. Do not edit by hand. */\nexport const genshinArchivedSnapshot =\n  genshinImpact as unknown as GenshinArchivedSnapshot;\n`,
    "utf8",
  );

  console.log(
    `exported from ${databaseHost} at ${exportedAt}: wow ${wow.counts.entityCount} entities / ${wow.counts.evidenceCount} evidence rows, genshin ${genshin.counts.characters} characters`,
  );
} finally {
  await client.close();
}
