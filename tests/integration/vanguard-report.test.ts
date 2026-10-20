import { randomUUID } from "node:crypto";
import { afterAll, beforeAll, expect, it } from "vitest";
import { eq } from "drizzle-orm";
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
  await service.report(null, { seatId, reason: "privacy" });
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
it("preserves report records and returns an explicit failure when email cannot be delivered", async () => {
  const service = createVanguardReportService(database.db, {
    notify: async () => {
      throw new Error("provider unavailable");
    },
  });
  await expect(service.report(null, { seatId, reason: "other" })).rejects.toMatchObject({
    code: "REPORT_NOTIFICATION_FAILED",
  });
  expect(
    (
      await database.db
        .select()
        .from(vanguardReports)
        .where(eq(vanguardReports.inscriptionId, inscriptionId))
    ).length,
  ).toBe(2);
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
