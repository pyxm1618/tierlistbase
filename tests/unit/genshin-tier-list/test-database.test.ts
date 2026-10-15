import { afterEach, expect, it, vi } from "vitest";
import { genshinTestDatabaseUrl } from "../../genshin-tier-list/database";

afterEach(() => vi.unstubAllEnvs());

it.each(["creat_web_test", "creat_web_e2e", "creat_web_perf", "creat_web_clean"])(
  "allows the isolated local CI database %s",
  (name) => {
    const url = `postgres://localhost/${name}`;
    vi.stubEnv("TEST_DATABASE_URL", url);
    expect(genshinTestDatabaseUrl()).toBe(url);
  },
);

it.each([
  "postgres://example.neon.tech/creat_web_test",
  "postgres://localhost/tierlistbase",
  "postgres://localhost/production",
])("rejects a remote or non-test fixture target", (url) => {
  vi.stubEnv("TEST_DATABASE_URL", url);
  expect(genshinTestDatabaseUrl).toThrow(/local test database/);
});

it("requires an explicit test database instead of falling back to DATABASE_URL", () => {
  vi.stubEnv("TEST_DATABASE_URL", "");
  vi.stubEnv("DATABASE_URL", "postgres://localhost/tierlistbase");
  expect(genshinTestDatabaseUrl).toThrow(/TEST_DATABASE_URL is required/);
});
