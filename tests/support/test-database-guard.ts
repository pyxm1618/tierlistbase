export const KNOWN_PRODUCTION_ENDPOINTS = ["ep-bitter-violet-b8txeicb"] as const;

const ISOLATED_TEST_DB_NAME_PATTERN = /(?:^|[_-])(test|e2e|perf|clean)(?:[_-]|$)/i;

/**
 * Validates that the provided or current environment specifies a safe, isolated test database
 * before allowing any destructive database operations (DROP SCHEMA, TRUNCATE, schema reset, migrations reset).
 *
 * Rules:
 * 1. TEST_DATABASE_URL must be explicitly configured and non-empty.
 * 2. APP_ENV must not be 'production'; if specified, must be 'test'.
 * 3. TEST_DATABASE_URL must not be identical to DATABASE_URL.
 * 4. TEST_DATABASE_URL must not point to known production endpoints (e.g., ep-bitter-violet-b8txeicb).
 * 5. Database name must match isolated test naming conventions (test, e2e, perf, clean).
 */
export function assertSafeTestDatabaseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const testUrlValue = env.TEST_DATABASE_URL?.trim();
  if (!testUrlValue) {
    throw new Error(
      "Safety Guard Violation: TEST_DATABASE_URL is required for destructive test database operations.",
    );
  }

  const appEnv = env.APP_ENV?.trim();
  if (appEnv && appEnv !== "test") {
    throw new Error(
      `Safety Guard Violation: Destructive test database operations are forbidden in APP_ENV=${appEnv}. Must be 'test'.`,
    );
  }

  const databaseUrlValue = env.DATABASE_URL?.trim();
  if (databaseUrlValue && testUrlValue === databaseUrlValue) {
    throw new Error(
      "Safety Guard Violation: TEST_DATABASE_URL must not be identical to DATABASE_URL.",
    );
  }

  let parsed: URL;
  try {
    parsed = new URL(testUrlValue);
  } catch (err) {
    throw new Error(
      `Safety Guard Violation: TEST_DATABASE_URL is not a valid URL: ${(err as Error).message}`,
    );
  }

  if (!["postgres:", "postgresql:"].includes(parsed.protocol)) {
    throw new Error(
      `Safety Guard Violation: TEST_DATABASE_URL protocol must be postgres: or postgresql:, found '${parsed.protocol}'.`,
    );
  }

  const host = parsed.host.toLowerCase();
  for (const endpoint of KNOWN_PRODUCTION_ENDPOINTS) {
    if (host.includes(endpoint.toLowerCase())) {
      throw new Error(
        `Safety Guard Violation: TEST_DATABASE_URL points to known production endpoint '${endpoint}'. Refusing destructive database operations.`,
      );
    }
  }

  const dbName = parsed.pathname.replace(/^\//, "");
  if (!dbName || !ISOLATED_TEST_DB_NAME_PATTERN.test(dbName)) {
    throw new Error(
      `Safety Guard Violation: TEST_DATABASE_URL database name '${dbName}' is not explicitly marked as an isolated test database (must match /(?:^|[_-])(test|e2e|perf|clean)(?:[_-]|$)/i).`,
    );
  }

  return testUrlValue;
}

export function getSafeTestDatabaseUrl(): string {
  return assertSafeTestDatabaseUrl(process.env);
}
