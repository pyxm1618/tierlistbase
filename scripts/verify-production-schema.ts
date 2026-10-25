import { readMigrationFiles } from "drizzle-orm/migrator";
import { createDatabaseClient } from "@/platform/database/client";
import { assertSchemaCompatible } from "@/platform/database/schema-compatibility";
const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is required for the read-only production schema gate");
let connection: ReturnType<typeof createDatabaseClient> | undefined;
try {
  connection = createDatabaseClient(url, 1);
  await assertSchemaCompatible(connection.db, readMigrationFiles({ migrationsFolder: "drizzle" }));
  console.log(JSON.stringify({ event: "production_schema_compatible" }));
} catch {
  // Driver exceptions can contain connection details; do not emit them in release logs.
  console.error(
    "Production schema compatibility could not be verified; deployment stopped. Apply approved Drizzle migrations independently, then retry.",
  );
  process.exitCode = 1;
} finally {
  try {
    await connection?.close();
  } catch {
    console.error("Production schema connection could not close cleanly; deployment stopped.");
    process.exitCode = 1;
  }
}
