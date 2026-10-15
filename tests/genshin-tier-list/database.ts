import postgres from "postgres";
import { importReviewedPackage } from "../../scripts/editorial-import";
import { readReviewedPackage } from "../../scripts/editorial-package";
export function genshinTestDatabaseUrl() {
  const value = process.env.TEST_DATABASE_URL;
  if (!value) throw new Error("TEST_DATABASE_URL is required for Genshin database tests");
  const url = new URL(value);
  if (
    !["localhost", "127.0.0.1", "::1"].includes(url.hostname) ||
    !/(?:^|[_-])(test|e2e|perf|clean)(?:[_-]|$)/i.test(url.pathname.slice(1))
  ) {
    throw new Error("Genshin fixture writes require an explicitly named local test database");
  }
  return value;
}

export async function seedGenshinTestDatabase() {
  const sql = postgres(genshinTestDatabaseUrl(), { max: 1 });
  try {
    // Existing importer is used only for isolated test setup, never by UI/runtime.
    await importReviewedPackage(sql, await readReviewedPackage());
  } finally {
    await sql.end();
  }
}
