import { createHash } from "node:crypto";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { DatabaseClient } from "@/platform/database/client";
import { reportSchema } from "../domain/validation";
import { VanguardError } from "../domain/event";
import { vanguardInscriptions, vanguardReports } from "./schema";

// Resend retains keys for 24h. Leave an hour of margin; an ambiguous older send
// needs operator review, never a fresh automatic notification.
const NOTIFICATION_RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
export function createVanguardReportService(
  database: DatabaseClient,
  input: {
    notify: (report: {
      seatId: string;
      reason: string;
      timestamp: string;
      idempotencyKey: string;
    }) => Promise<void>;
  },
) {
  return {
    async report(reporterUserId: string | null, raw: z.infer<typeof reportSchema>) {
      const request = reportSchema.parse(raw);
      const payloadHash = createHash("sha256")
        .update(JSON.stringify([request.seatId, request.reason, reporterUserId]))
        .digest("hex");
      // Persist before provider I/O so email failure cannot discard the report.
      await database.transaction(async (tx) => {
        const [existing] = await tx
          .select()
          .from(vanguardReports)
          .where(eq(vanguardReports.operationId, request.operationId));
        if (existing) return;
        const [seat] = await tx
          .select({
            id: vanguardInscriptions.id,
            status: vanguardInscriptions.status,
            userId: vanguardInscriptions.userId,
          })
          .from(vanguardInscriptions)
          .where(eq(vanguardInscriptions.seatId, request.seatId))
          .limit(1);
        if (!seat || seat.status !== "active" || !seat.userId)
          throw new VanguardError("SEAT_NOT_FOUND", 404);
        await tx
          .insert(vanguardReports)
          .values({
            operationId: request.operationId,
            payloadHash,
            inscriptionId: seat.id,
            reporterUserId,
            reason: request.reason,
          })
          .onConflictDoNothing({ target: vanguardReports.operationId });
      });
      // Persist the first possible send time independently of the send transaction.
      // A crash/timeout after provider acceptance must not reset the retry window.
      await database.transaction(async (tx) => {
        const [record] = await tx
          .select()
          .from(vanguardReports)
          .where(eq(vanguardReports.operationId, request.operationId))
          .for("update");
        if (!record || record.payloadHash !== payloadHash)
          throw new VanguardError("IDEMPOTENCY_CONFLICT", 409);
        if (!record.notificationStartedAt)
          await tx
            .update(vanguardReports)
            .set({ notificationStartedAt: new Date() })
            .where(eq(vanguardReports.id, record.id));
      });
      const result = await database.transaction(async (tx) => {
        const [record] = await tx
          .select()
          .from(vanguardReports)
          .where(eq(vanguardReports.operationId, request.operationId))
          .for("update");
        if (!record || record.payloadHash !== payloadHash)
          throw new VanguardError("IDEMPOTENCY_CONFLICT", 409);
        if (record.notifiedAt) return { received: true as const };
        if (
          !record.notificationStartedAt ||
          Date.now() - record.notificationStartedAt.getTime() >= NOTIFICATION_RETRY_WINDOW_MS
        )
          return { error: new VanguardError("REPORT_NOTIFICATION_REVIEW_REQUIRED", 503) };
        try {
          await input.notify({
            seatId: request.seatId,
            reason: record.reason,
            timestamp: record.createdAt.toISOString(),
            idempotencyKey: `vanguard-report/${record.id}`,
          });
        } catch {
          return { error: new VanguardError("REPORT_NOTIFICATION_FAILED", 503) };
        }
        await tx
          .update(vanguardReports)
          .set({ notifiedAt: new Date() })
          .where(eq(vanguardReports.id, record.id));
        return { received: true as const };
      });
      if ("error" in result) throw result.error;
      return result;
    },
  };
}
