import { assertSafeTestDatabaseUrl } from "./test-database-guard";

// Enforce test database safety guard globally before any integration test suite initializes.
// If TEST_DATABASE_URL is missing, identical to DATABASE_URL, or points to production, fail-closed immediately.
assertSafeTestDatabaseUrl();
