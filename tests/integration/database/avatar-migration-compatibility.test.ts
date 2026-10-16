import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { afterAll, expect, it } from "vitest";
import { createDatabaseClient } from "@/platform/database/client";
import { assertSafeTestDatabaseUrl } from "../../support/test-database-guard";

const database = createDatabaseClient(assertSafeTestDatabaseUrl());
afterAll(async () => database.close());

it("does not replay the avatar migration already applied with its original timestamp", async () => {
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS public CASCADE"));
  await database.db.execute(sql.raw("DROP SCHEMA IF EXISTS drizzle CASCADE"));
  await database.db.execute(sql.raw("CREATE SCHEMA public"));
  const options = {
    migrationsFolder: "drizzle",
    migrationsSchema: "drizzle",
    migrationsTable: "__drizzle_migrations",
  };
  await migrate(database.db, options);
  const hash = createHash("sha256")
    .update(await readFile("drizzle/0018_flashy_havok.sql", "utf8"))
    .digest("hex");
  const existing = await database.db.execute(sql`
    update drizzle.__drizzle_migrations set created_at = 1792058386430
    where hash = ${hash} returning id
  `);
  expect(existing).toHaveLength(1);
  await migrate(database.db, options);
  const columns = await database.db.execute(sql`
    select data_type from information_schema.columns
    where table_schema = 'public' and table_name = 'entity_profiles' and column_name = 'avatar'
  `);
  expect(columns.map((column) => column.data_type)).toEqual(["jsonb"]);
});
