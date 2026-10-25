import { spawnSync } from "node:child_process";
import { expect, it } from "vitest";
it("fails closed without exposing malformed database credentials", () => {
  const result = spawnSync("bun", ["scripts/verify-production-schema.ts"], {
    env: { ...process.env, DATABASE_URL: "postgres://gate-user:gate-secret-sentinel@[/test" },
    encoding: "utf8",
  });
  expect(result.status).toBe(1);
  expect(result.stdout + result.stderr).not.toContain("gate-secret-sentinel");
  expect(result.stderr).toContain("deployment stopped");
});
