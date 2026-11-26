import { createDatabaseClient } from "../src/platform/database/client";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL required");
const client = createDatabaseClient(url, 1);
try {
  const who = await client.db.execute(
    // eslint-disable-next-line
    (await import("drizzle-orm")).sql.raw(
      "select current_user as role, current_database() as db, current_schema() as schema",
    ),
  );
  console.log("identity", JSON.stringify(who));
  const grants = await client.db.execute(
    (await import("drizzle-orm")).sql.raw(
      "select table_schema, table_name, string_agg(privilege_type, ',' order by privilege_type) as privs from information_schema.role_table_grants where grantee = current_user group by 1,2 order by 1,2",
    ),
  );
  console.log("grants", JSON.stringify(grants));
  for (const table of ["games", "game_versions", "ranking_contexts", "entities", "ratings", "sources", "source_ratings", "rating_changes", "evidence_observations", "entity_profiles"]) {
    try {
      const rows = await client.db.execute(
        (await import("drizzle-orm")).sql.raw(`select count(*)::int as n from public.${table}`),
      );
      console.log("count", table, JSON.stringify(rows));
    } catch (error) {
      console.log("denied", table, error instanceof Error ? error.message.slice(0, 120) : String(error));
    }
  }
} finally {
  await client.close();
}
