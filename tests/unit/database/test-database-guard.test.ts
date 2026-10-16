import { afterEach, describe, expect, it, vi } from "vitest";

import {
  assertSafeTestDatabaseUrl,
  getSafeTestDatabaseUrl,
  KNOWN_PRODUCTION_ENDPOINTS,
} from "../../support/test-database-guard";

describe("Test Database Production Guard", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("Case A: TEST_DATABASE_URL missing", () => {
    it("refuses to run when TEST_DATABASE_URL is undefined", () => {
      vi.stubEnv("TEST_DATABASE_URL", "");
      vi.stubEnv("DATABASE_URL", "postgres://localhost:5432/creat_web_app");

      expect(() => assertSafeTestDatabaseUrl()).toThrow(
        /TEST_DATABASE_URL is required for destructive test database operations/i,
      );
    });

    it("refuses to run when TEST_DATABASE_URL is whitespace only", () => {
      vi.stubEnv("TEST_DATABASE_URL", "   ");

      expect(() => assertSafeTestDatabaseUrl()).toThrow(
        /TEST_DATABASE_URL is required for destructive test database operations/i,
      );
    });
  });

  describe("Case B: TEST_DATABASE_URL === DATABASE_URL", () => {
    it("refuses to run when TEST_DATABASE_URL is identical to DATABASE_URL", () => {
      const url = "postgres://postgres:postgres@localhost:5432/creat_web_test";
      vi.stubEnv("TEST_DATABASE_URL", url);
      vi.stubEnv("DATABASE_URL", url);

      expect(() => assertSafeTestDatabaseUrl()).toThrow(
        /TEST_DATABASE_URL must not be identical to DATABASE_URL/i,
      );
    });
  });

  it("rejects the same database when credentials or query parameters differ", () => {
    expect(() =>
      assertSafeTestDatabaseUrl({
        NODE_ENV: "test",
        APP_ENV: "test",
        DATABASE_URL: "postgres://owner@localhost:5432/shared_test",
        TEST_DATABASE_URL: "postgresql://tester@localhost/shared_test?sslmode=disable",
      }),
    ).toThrow(/same database/i);
  });

  describe("Case C: TEST_DATABASE_URL points to known Production endpoint", () => {
    it.each(KNOWN_PRODUCTION_ENDPOINTS)(
      "refuses to run when TEST_DATABASE_URL points to production endpoint %s",
      (endpoint) => {
        const prodUrl = `postgresql://neondb_owner:secret@${endpoint}-pooler.c-14.us-east-1.aws.neon.tech/creat_web_test?sslmode=require`;
        vi.stubEnv("TEST_DATABASE_URL", prodUrl);
        vi.stubEnv("DATABASE_URL", "postgres://localhost:5432/creat_web_app");

        expect(() => assertSafeTestDatabaseUrl()).toThrow(/points to known production endpoint/i);
      },
    );

    it("refuses to run when TEST_DATABASE_URL points to non-pooler production host", () => {
      const prodUrl =
        "postgresql://neondb_owner:secret@ep-bitter-violet-b8txeicb.c-14.us-east-1.aws.neon.tech/creat_web_test?sslmode=require";
      vi.stubEnv("TEST_DATABASE_URL", prodUrl);
      vi.stubEnv("DATABASE_URL", "postgres://localhost:5432/creat_web_app");

      expect(() => assertSafeTestDatabaseUrl()).toThrow(/points to known production endpoint/i);
    });
  });

  describe("Case D: Valid isolated test PostgreSQL", () => {
    it.each(["creat_web_test", "tierlist_test", "tierlistbase_e2e", "my_perf_db", "test_clean"])(
      "continues normally for valid isolated test PostgreSQL database %s",
      (dbName) => {
        const testUrl = `postgres://postgres:postgres@localhost:5432/${dbName}`;
        const appUrl = "postgres://postgres:postgres@localhost:5432/creat_web_app";
        vi.stubEnv("TEST_DATABASE_URL", testUrl);
        vi.stubEnv("DATABASE_URL", appUrl);
        vi.stubEnv("APP_ENV", "test");

        expect(assertSafeTestDatabaseUrl()).toBe(testUrl);
        expect(getSafeTestDatabaseUrl()).toBe(testUrl);
      },
    );
  });

  describe("Additional safety guard rules", () => {
    it("refuses to run when APP_ENV is set to production", () => {
      const testUrl = "postgres://postgres:postgres@localhost:5432/creat_web_test";
      vi.stubEnv("TEST_DATABASE_URL", testUrl);
      vi.stubEnv("DATABASE_URL", "postgres://localhost:5432/creat_web_app");
      vi.stubEnv("APP_ENV", "production");

      expect(() => assertSafeTestDatabaseUrl()).toThrow(
        /Destructive test database operations are forbidden in APP_ENV=production/i,
      );
    });

    it("refuses to run when database name is not an isolated test database (e.g. neondb)", () => {
      const testUrl = "postgres://localhost:5432/neondb";
      vi.stubEnv("TEST_DATABASE_URL", testUrl);
      vi.stubEnv("DATABASE_URL", "postgres://localhost:5432/creat_web_app");

      expect(() => assertSafeTestDatabaseUrl()).toThrow(
        /not explicitly marked as an isolated test database/i,
      );
    });

    it("refuses to run when protocol is not postgres: or postgresql:", () => {
      const testUrl = "mysql://localhost:3306/creat_web_test";
      vi.stubEnv("TEST_DATABASE_URL", testUrl);
      vi.stubEnv("DATABASE_URL", "postgres://localhost:5432/creat_web_app");

      expect(() => assertSafeTestDatabaseUrl()).toThrow(
        /protocol must be postgres: or postgresql:/i,
      );
    });
  });
});
