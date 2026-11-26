/**
 * Read-only parity audit: committed archived snapshot vs. the authoritative production database.
 *
 * The snapshot is served to public pages, so a reviewer needs a way to prove the artifact still
 * equals what the publishers wrote — without trusting the `provenance` block it carries. This
 * script re-runs the repository's own query functions against the database inside a READ ONLY
 * transaction and compares the complete payload field by field.
 *
 * Data is not perfectly ordered by every SQL query, so each dataset is hashed twice:
 *   - `strict`  : arrays compared in stored order (the payload that is actually rendered);
 *   - `ordered` : arrays sorted by canonical element content.
 * `MATCH` requires strict equality. `ORDER_ONLY` means the content is identical but the sequence
 * differs, which still needs a human decision because render order is part of the snapshot.
 *
 * Usage (no credential is ever printed):
 *
 *   bun --conditions=react-server scripts/verify-archived-snapshot-parity.ts \
 *     --database-url-file=/absolute/path/to/.env.local
 *
 * Exit code 0 only when every dataset reports MATCH and the editorial package checksums pass.
 */
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { sql } from "drizzle-orm";

import { loadGenshinData } from "../src/modules/genshin-tier-list/data";
import {
  resolveEditorialPackage,
  verifyEditorialChecksums,
} from "../src/modules/genshin-tier-list/editorial-package";
import { getGameMetaBoardData, getRecentRatingChanges } from "../src/modules/meta-board/db/queries";
import { createDatabaseClient, type DatabaseClient } from "../src/platform/database/client";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const WOW_SNAPSHOT = "src/modules/meta-board/db/archived-snapshots/wow-forever.json";
const GENSHIN_SNAPSHOT = "src/modules/genshin-tier-list/archived-snapshots/genshin-impact.json";
const WOW_ROLES = ["dps", "tank", "healer"] as const;

function resolveDatabaseUrl(): string {
  const direct = process.env.DATABASE_URL;
  if (direct) return direct;
  const fileArgument = process.argv.find((argument) => argument.startsWith("--database-url-file="));
  if (!fileArgument) throw new Error("Provide DATABASE_URL or --database-url-file=<path>");
  const contents = readFileSync(fileArgument.slice("--database-url-file=".length), "utf8");
  const line = contents.split("\n").find((entry) => entry.startsWith("DATABASE_URL="));
  if (!line) throw new Error("The given file has no DATABASE_URL entry");
  return line
    .slice("DATABASE_URL=".length)
    .trim()
    .replace(/^["']|["']$/g, "");
}

/** JSON round trip normalizes `Date` to the exact ISO form the snapshot stores. */
function normalize<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function canonical(value: unknown, sortArrays: boolean): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value) ?? "null";
  if (Array.isArray(value)) {
    const items = value.map((item) => canonical(item, sortArrays));
    if (sortArrays) items.sort();
    return `[${items.join(",")}]`;
  }
  const entries = Object.entries(value as Record<string, unknown>)
    .filter(([, item]) => item !== undefined)
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([key, item]) => `${JSON.stringify(key)}:${canonical(item, sortArrays)}`);
  return `{${entries.join(",")}}`;
}

function hash(value: unknown, sortArrays: boolean): string {
  return createHash("sha256").update(canonical(value, sortArrays)).digest("hex");
}

function diffPaths(left: unknown, right: unknown, prefix = "", found: string[] = []): string[] {
  if (found.length >= 15) return found;
  const isObject = (input: unknown): input is Record<string, unknown> =>
    typeof input === "object" && input !== null;
  if (!isObject(left) || !isObject(right)) {
    if (canonical(left, false) !== canonical(right, false)) found.push(prefix || "<root>");
    return found;
  }
  const keys = new Set([...Object.keys(left), ...Object.keys(right)]);
  for (const key of [...keys].sort()) {
    diffPaths(left[key], right[key], prefix ? `${prefix}.${key}` : key, found);
    if (found.length >= 15) break;
  }
  return found;
}

type Verdict = "MATCH" | "ORDER_ONLY" | "MISMATCH";

const rows: Array<{
  dataset: string;
  items: number;
  strict: string;
  ordered: string;
  verdict: Verdict;
  detail?: string;
}> = [];

function compare(
  dataset: string,
  items: number,
  snapshotSide: unknown,
  databaseSide: unknown,
): void {
  const left = normalize(snapshotSide);
  const right = normalize(databaseSide);
  const strictLeft = hash(left, false);
  const strictRight = hash(right, false);
  const orderedLeft = hash(left, true);
  const orderedRight = hash(right, true);

  const verdict: Verdict =
    strictLeft === strictRight ? "MATCH" : orderedLeft === orderedRight ? "ORDER_ONLY" : "MISMATCH";

  rows.push({
    dataset,
    items,
    strict: strictLeft.slice(0, 16),
    ordered: orderedLeft.slice(0, 16),
    verdict,
    ...(verdict === "MISMATCH"
      ? { detail: diffPaths(left, right).join(", ") }
      : verdict === "ORDER_ONLY"
        ? { detail: "content equal, sequence differs" }
        : {}),
  });
}

const snapshotWow = JSON.parse(readFileSync(path.join(root, WOW_SNAPSHOT), "utf8")) as {
  provenance: Record<string, unknown>;
  roles: Record<string, { board: unknown; changes: unknown[] }>;
};
const snapshotGenshin = JSON.parse(readFileSync(path.join(root, GENSHIN_SNAPSHOT), "utf8")) as {
  provenance: Record<string, unknown>;
  data: { version: string; context: string; characters: unknown[]; evidenceCount: number };
};

const databaseUrl = resolveDatabaseUrl();
const client = createDatabaseClient(databaseUrl, 1);
let failures = 0;

try {
  // Read-only by construction: the transaction cannot write, so this audit cannot mutate production.
  await client.db.execute(sql.raw("begin read only"));
  const readOnlyRows = (await client.db.execute(
    sql.raw("show transaction_read_only"),
  )) as unknown as Array<{ transaction_read_only: string }>;
  const readOnly = readOnlyRows[0]?.transaction_read_only;
  if (readOnly !== "on") throw new Error(`Expected a read-only transaction, got "${readOnly}"`);

  const database = client.db as unknown as DatabaseClient;

  for (const role of WOW_ROLES) {
    const board = await getGameMetaBoardData({
      gameSlug: "wow-forever",
      mode: "dungeon",
      role,
      levelCap: 30,
      db: database,
    });
    const changes =
      board.activeContext && board.version
        ? await getRecentRatingChanges("wow-forever", 10, database, {
            rankingContextId: board.activeContext.id,
            toVersionId: board.version.id,
          })
        : [];
    const roleSnapshot = snapshotWow.roles[role];
    if (!roleSnapshot) throw new Error(`Snapshot is missing WoW role ${role}`);
    const items = (board.tiers ?? []).flatMap((group) => group.items);
    compare(`wow:${role}:board`, items.length, roleSnapshot.board, board);
    compare(`wow:${role}:changes`, changes.length, roleSnapshot.changes, changes);
  }

  const genshin = await loadGenshinData(database);
  if (genshin.status !== "available") throw new Error("Genshin read-back is unavailable");
  compare("genshin:data", genshin.data.characters.length, snapshotGenshin.data, genshin.data);

  // Prose provenance claims are checked against re-derived values, not trusted as-is.
  compare(
    "genshin:version-context",
    1,
    {
      version: snapshotGenshin.provenance.version,
      editorialPackage: snapshotGenshin.provenance.editorialPackage,
    },
    {
      version: genshin.data.version,
      editorialPackage: resolveEditorialPackage({
        version: genshin.data.version,
        rankingContext: genshin.data.context,
        rootDir: root,
      }).relativePath,
    },
  );

  const pkg = resolveEditorialPackage({
    version: genshin.data.version,
    rankingContext: genshin.data.context,
    rootDir: root,
  });
  const checksummed = await verifyEditorialChecksums(pkg);
  console.log(
    `editorial checksums: ${checksummed}/${checksummed} verified for ${pkg.relativePath}`,
  );

  await client.db.execute(sql.raw("rollback"));
} catch (error) {
  failures += 1;
  console.error(error instanceof Error ? error.message : error);
  try {
    await client.db.execute(sql.raw("rollback"));
  } catch {
    /* the transaction may already be closed */
  }
} finally {
  await client.close();
}

console.log(`\nread-back: ${rows.length} datasets compared inside a READ ONLY transaction\n`);
const width = Math.max(...rows.map((row) => row.dataset.length), 7);
console.log(`${"dataset".padEnd(width)}  items  strict            verdict`);
for (const row of rows) {
  console.log(
    `${row.dataset.padEnd(width)}  ${String(row.items).padStart(5)}  ${row.strict}  ${row.verdict}`,
  );
  if (row.verdict !== "MATCH" && row.detail) console.log(`${" ".repeat(width + 9)}↳ ${row.detail}`);
}

const mismatches = rows.filter((row) => row.verdict !== "MATCH");
if (mismatches.length > 0) {
  failures += mismatches.length;
  console.error(`\n${mismatches.length} dataset(s) did not match strictly.`);
}

console.log(
  failures === 0
    ? "\nPRODUCTION PARITY: VERIFIED (all datasets match strictly)"
    : `\nPRODUCTION PARITY: FAILED (${failures} finding(s))`,
);
process.exitCode = failures === 0 ? 0 : 1;
