import { expect, it, vi } from "vitest";
vi.mock("server-only", () => ({}));
const batch = vi.fn().mockResolvedValue({ processed: 1 });
const collect = vi
  .fn()
  .mockResolvedValue({ jobBacklog: 2, oldestJobAgeSeconds: 1800, failed: 1, deadLetters: 1 });
const emit = vi.fn();
vi.mock("@/platform/accounts/account-deletion-runtime", () => ({
  getAccountDeletionService: () => ({ runDueBatch: batch }),
}));
vi.mock("@/platform/config/env", () => ({ env: { cronSecret: "test-cron-secret" } }));
vi.mock("@/platform/database/application-database", () => ({ db: {} }));
vi.mock("@/platform/observability/operational-snapshot", () => ({
  collectAccountDeletionSnapshot: collect,
}));
vi.mock("@/platform/observability/alerts", async (importOriginal) => ({
  ...(await importOriginal<object>()),
  emitOperationalAlerts: emit,
}));
it("evaluates deletion alerts without obtaining a commerce runtime", async () => {
  const { GET } = await import("@/app/api/internal/jobs/account-deletion/route");
  const result = await GET(
    new Request("https://example.test/api/internal/jobs/account-deletion", {
      headers: { authorization: "Bearer test-cron-secret" },
    }),
  );
  expect(result.status).toBe(200);
  expect(batch).toHaveBeenCalledWith(10);
  expect(collect).toHaveBeenCalled();
  expect(emit).toHaveBeenCalledWith(
    expect.arrayContaining([
      expect.objectContaining({ event: "operational_alert", code: "account_deletion_dead_letter" }),
    ]),
  );
});
