import { readMigrationFiles } from "drizzle-orm/migrator";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, expect, it } from "vitest";
import { createDatabaseClient } from "@/platform/database/client";
import { assertSchemaCompatible } from "@/platform/database/schema-compatibility";
import { assertSafeTestDatabaseUrl } from "../../support/test-database-guard";
const connection = createDatabaseClient(assertSafeTestDatabaseUrl());
const required = readMigrationFiles({ migrationsFolder: "drizzle" });
beforeAll(async () => {
  await migrate(connection.db, { migrationsFolder: "drizzle" });
});
afterAll(async () => connection.close());
it("accepts the deployed migration chain and never writes to the database", async () => {
  await expect(assertSchemaCompatible(connection.db, required)).resolves.toBeUndefined();
});
it("fails closed on missing, stale, or changed migration history", async () => {
  await expect(
    assertSchemaCompatible(connection.db, [
      ...required,
      { hash: "missing", folderMillis: Date.now() },
    ]),
  ).rejects.toThrow("schema is not compatible");
  await expect(
    assertSchemaCompatible(connection.db, [{ ...required[0]!, hash: "changed" }]),
  ).rejects.toThrow("schema is not compatible");
  await connection.db.execute(
    sql`alter table drizzle.__drizzle_migrations rename to closeout_migrations_hidden`,
  );
  try {
    await expect(assertSchemaCompatible(connection.db, required)).rejects.toThrow();
  } finally {
    await connection.db.execute(
      sql`alter table drizzle.closeout_migrations_hidden rename to __drizzle_migrations`,
    );
  }
});
