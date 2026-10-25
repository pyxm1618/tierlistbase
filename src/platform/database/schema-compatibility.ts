import { sql } from "drizzle-orm";
import type { DatabaseClient } from "./client";

/** Read-only release gate: every required migration must have its exact applied hash. */
export async function assertSchemaCompatible(
  database: DatabaseClient,
  required: readonly { hash: string; folderMillis: number }[],
): Promise<void> {
  if (!required.length)
    throw new Error("schema compatibility requires a non-empty migration chain");
  await database.transaction(async (tx) => {
    await tx.execute(sql.raw("set transaction read only"));
    await tx.execute(sql.raw("set local statement_timeout = '10000ms'"));
    const rows = await tx.execute<{ hash: string; created_at: string }>(
      sql`select hash, created_at from drizzle.__drizzle_migrations`,
    );
    if (
      required.some(
        (migration) =>
          !rows.some(
            (row) =>
              Number(row.created_at) === migration.folderMillis && row.hash === migration.hash,
          ),
      )
    )
      throw new Error("production schema is not compatible with this application migration chain");
  });
}
