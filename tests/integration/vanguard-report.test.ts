import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { eq, sql } from "drizzle-orm";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabaseClient } from "@/platform/database/client";
import { user } from "@/platform/database/auth-schema";
import {
  createVanguardReportService,
  vanguardInscriptions,
  vanguardReports,
  hideVanguardInscription,
} from "@/modules/wow-vanguard";
import { assertSafeTestDatabaseUrl } from "../support/test-database-guard";

const database = createDatabaseClient(assertSafeTestDatabaseUrl());
const owner = randomUUID();
const seatId = "WOW-O-1111";
let inscriptionId: string;

beforeAll(async () => {
  await migrate(database.db, { migrationsFolder: "drizzle" });
  await database.db
    .insert(user)
    .values({ id: owner, name: "Private Google", email: `${owner}@example.test` });
  await database.db
    .delete(vanguardReports)
    .where(eq(vanguardReports.inscriptionId, "00000000-0000-0000-0000-000000000000"));
  const [record] = await database.db
    .insert(vanguardInscriptions)
    .values({
      userId: owner,
      seatId,
      phase: "wow",
      letter: "O",
      localIndex: 1111,
      displayName: "Public Vanguard",
      faction: "alliance",
      className: "Mage",
    })
    .returning();
  inscriptionId = record!.id;
});

afterAll(async () => {
  await database.db.delete(vanguardReports).where(eq(vanguardReports.inscriptionId, inscriptionId));
  await database.db.delete(vanguardInscriptions).where(eq(vanguardInscriptions.id, inscriptionId));
  await database.db.delete(user).where(eq(user.id, owner));
  await database.close();
});

it("stores the fixed reason and sends the required public notification without hiding", async () => {
  let notified: unknown;
  const service = createVanguardReportService(database.db, {
    notify: async (report) => {
      notified = report;
    },
  });
  await service.report(null, { seatId, reason: "privacy", operationId: randomUUID() });
  expect(notified).toMatchObject({ seatId, reason: "privacy" });
  expect(JSON.stringify(notified)).not.toMatch(/Public Vanguard|Private Google|email|ownerUserId/);
  expect(
    (
      await database.db
        .select()
        .from(vanguardReports)
        .where(eq(vanguardReports.inscriptionId, inscriptionId))
    ).length,
  ).toBe(1);
  expect(
    (
      await database.db
        .select()
        .from(vanguardInscriptions)
        .where(eq(vanguardInscriptions.id, inscriptionId))
    )[0]?.status,
  ).toBe("active");
});

it("does not hold the report row lock while provider notification is pending", async () => {
  let notifyStarted!: () => void;
  let releaseNotify!: () => void;
  const started = new Promise<void>((resolve) => {
    notifyStarted = resolve;
  });
  const released = new Promise<void>((resolve) => {
    releaseNotify = resolve;
  });
  const request = { seatId, reason: "privacy" as const, operationId: randomUUID() };
  const service = createVanguardReportService(database.db, {
    notify: async () => {
      notifyStarted();
      await released;
    },
  });

  const reporting = service.report(null, request);
  await started;

  let lockError: unknown;
  try {
    await database.db.transaction(async (tx) => {
      await tx.execute(sql.raw("set local lock_timeout = '250ms'"));
      await tx
        .update(vanguardReports)
        .set({ status: "new" })
        .where(eq(vanguardReports.operationId, request.operationId));
    });
  } catch (error) {
    lockError = error;
  } finally {
    releaseNotify();
  }
  await reporting;
  expect(lockError).toBeUndefined();
});

it("preserves report records and returns an explicit failure when email cannot be delivered", async () => {
  const service = createVanguardReportService(database.db, {
    notify: async () => {
      throw new Error("provider unavailable");
    },
  });
  await expect(
    service.report(null, { seatId, reason: "other", operationId: randomUUID() }),
  ).rejects.toMatchObject({
    code: "REPORT_NOTIFICATION_FAILED",
  });
  expect(
    (
      await database.db
        .select()
        .from(vanguardReports)
        .where(eq(vanguardReports.inscriptionId, inscriptionId))
    ).length,
  ).toBe(3);
});

it("deduplicates concurrent anonymous retries and conflicts on changed payload", async () => {
  let notifications = 0;
  let notifyStarted!: () => void;
  let releaseNotify!: () => void;
  const started = new Promise<void>((resolve) => {
    notifyStarted = resolve;
  });
  const released = new Promise<void>((resolve) => {
    releaseNotify = resolve;
  });
  const service = createVanguardReportService(database.db, {
    notify: async () => {
      notifications++;
      if (notifications === 1) {
        notifyStarted();
        await released;
      }
    },
  });
  const request = { seatId, reason: "spam_promotion" as const, operationId: randomUUID() };
  const first = service.report(null, request);
  await started;
  const second = service.report(null, request);
  await new Promise((resolve) => setTimeout(resolve, 150));
  expect(notifications).toBe(1);
  releaseNotify();
  await Promise.all([first, second]);
  await service.report(null, request);
  expect(notifications).toBe(1);
  expect(
    (
      await database.db
        .select()
        .from(vanguardReports)
        .where(eq(vanguardReports.operationId, request.operationId))
    ).length,
  ).toBe(1);
  await expect(service.report(null, { ...request, reason: "other" })).rejects.toMatchObject({
    code: "IDEMPOTENCY_CONFLICT",
    status: 409,
  });
  await service.report(null, { ...request, operationId: randomUUID() });
  expect(notifications).toBe(2);
});

it("retries ambiguous provider delivery with a stable key and payload while preserving the row", async () => {
  const delivered = new Set<string>();
  const attempts: unknown[] = [];
  let fail = true;
  const service = createVanguardReportService(database.db, {
    notify: async (report) => {
      attempts.push({
        seatId: report.seatId,
        reason: report.reason,
        timestamp: report.timestamp,
        idempotencyKey: report.idempotencyKey,
      });
      delivered.add(report.idempotencyKey);
      if (fail) {
        fail = false;
        throw new Error("response lost after provider accepted");
      }
    },
  });
  const request = { seatId, reason: "other" as const, operationId: randomUUID() };
  await expect(service.report(null, request)).rejects.toMatchObject({
    code: "REPORT_NOTIFICATION_FAILED",
  });
  const [failedRow] = await database.db
    .select()
    .from(vanguardReports)
    .where(eq(vanguardReports.operationId, request.operationId));
  expect(failedRow?.notifiedAt).toBeNull();
  expect(failedRow?.notificationClaimToken).toBeNull();
  expect(failedRow?.notificationClaimedAt).toBeNull();
  expect(failedRow?.notificationStartedAt).not.toBeNull();

  await service.report(null, request);
  const [notifiedRow] = await database.db
    .select()
    .from(vanguardReports)
    .where(eq(vanguardReports.operationId, request.operationId));
  expect(notifiedRow?.notifiedAt).not.toBeNull();
  expect(notifiedRow?.notificationStartedAt?.getTime()).toBe(
    failedRow?.notificationStartedAt?.getTime(),
  );

  await service.report(null, request);
  expect(attempts).toHaveLength(2);
  expect(attempts[0]).toEqual(attempts[1]);
  expect(delivered.size).toBe(1);
  expect(
    (
      await database.db
        .select()
        .from(vanguardReports)
        .where(eq(vanguardReports.operationId, request.operationId))
    ).length,
  ).toBe(1);
});

it("never resends an unresolved notification beyond the provider deduplication window", async () => {
  const request = { seatId, reason: "privacy" as const, operationId: randomUUID() };
  const failed = createVanguardReportService(database.db, {
    notify: async () => {
      throw new Error("timeout");
    },
  });
  await expect(failed.report(null, request)).rejects.toMatchObject({
    code: "REPORT_NOTIFICATION_FAILED",
  });
  await database.db
    .update(vanguardReports)
    .set({ notificationStartedAt: new Date(Date.now() - 24 * 60 * 60 * 1000) })
    .where(eq(vanguardReports.operationId, request.operationId));
  let sends = 0;
  const retry = createVanguardReportService(database.db, {
    notify: async () => {
      sends++;
    },
  });
  await expect(retry.report(null, request)).rejects.toMatchObject({
    code: "REPORT_NOTIFICATION_REVIEW_REQUIRED",
  });
  expect(sends).toBe(0);
});

it("operations hiding keeps the same occupied Seat and account uniqueness", async () => {
  await hideVanguardInscription(database.db, seatId, "hidden", async () => {});
  const [row] = await database.db
    .select()
    .from(vanguardInscriptions)
    .where(eq(vanguardInscriptions.id, inscriptionId));
  expect(row?.status).toBe("hidden");
  expect(row?.seatId).toBe(seatId);
  expect(row?.userId).toBe(owner);
});
