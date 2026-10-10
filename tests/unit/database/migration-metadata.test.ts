import { afterEach, expect, it } from "vitest";
import { cp, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { verifyMigrationMetadata } from "../../../scripts/verify-migration-metadata";

const temporaryFolders = new Set<string>();
const schemaPath = [
  path.resolve("src/platform/database/schema.ts"),
  path.resolve("src/modules/meta-board/db/schema.ts"),
];

afterEach(async () => {
  await Promise.all(
    [...temporaryFolders].map((folder) => rm(folder, { recursive: true, force: true })),
  );
  temporaryFolders.clear();
});

async function migrationFixture(): Promise<string> {
  const folder = await mkdtemp(path.join(tmpdir(), "creat-web-migration-metadata-test-"));
  temporaryFolders.add(folder);
  const migrationsDirectory = path.join(folder, "drizzle");
  await cp(path.resolve("drizzle"), migrationsDirectory, { recursive: true });
  return migrationsDirectory;
}

it("rejects a journal entry whose snapshot is missing", async () => {
  const migrationsDirectory = await migrationFixture();
  await rm(path.join(migrationsDirectory, "meta", "0012_snapshot.json"));

  await expect(verifyMigrationMetadata({ migrationsDirectory, schemaPath })).rejects.toThrow(
    /missing snapshot.*0012/i,
  );
});

it("rejects a coherent snapshot chain that has drifted from the current schema", async () => {
  const migrationsDirectory = await migrationFixture();
  const journal = JSON.parse(
    await readFile(path.join(migrationsDirectory, "meta", "_journal.json"), "utf8"),
  ) as { entries: Array<{ idx: number }> };
  const lastIdx = journal.entries[journal.entries.length - 1]!.idx;
  const snapshotNumber = String(lastIdx).padStart(4, "0");
  const snapshotPath = path.join(migrationsDirectory, "meta", `${snapshotNumber}_snapshot.json`);
  const snapshot = JSON.parse(await readFile(snapshotPath, "utf8")) as {
    tables: Record<string, { indexes?: Record<string, unknown> }>;
  };
  if (snapshot.tables["public.refunds"]?.indexes) {
    delete snapshot.tables["public.refunds"].indexes["refund_provider_reconciliation_due_idx"];
  } else {
    delete snapshot.tables["public.games"];
  }
  await writeFile(snapshotPath, `${JSON.stringify(snapshot, null, 2)}\n`, "utf8");

  await expect(verifyMigrationMetadata({ migrationsDirectory, schemaPath })).rejects.toThrow(
    /schema drift/i,
  );
});

it("accepts the checked-in snapshot chain without creating repository artifacts", async () => {
  await expect(
    verifyMigrationMetadata({
      migrationsDirectory: path.resolve("drizzle"),
      schemaPath,
    }),
  ).resolves.toBeUndefined();
});
