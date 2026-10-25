import { createHash, randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { DatabaseClient } from "@/platform/database/client";
import { reportSchema } from "../domain/validation";
import { VanguardError } from "../domain/event";
import { vanguardInscriptions, vanguardReports } from "./schema";

// Resend retains keys for 24h. Leave an hour of margin; an ambiguous older send
// needs operator review, never a fresh automatic notification.
const NOTIFICATION_RETRY_WINDOW_MS = 23 * 60 * 60 * 1000;
const NOTIFICATION_PROVIDER_TIMEOUT_MS = 30 * 1000;
const NOTIFICATION_CLAIM_LEASE_MS = 60 * 1000;
const NOTIFICATION_WAIT_POLL_MS = 100;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createVanguardReportService(
  database: DatabaseClient,
  input: {
    notify: (report: {
      seatId: string;
      reason: string;
      timestamp: string;
      idempotencyKey: string;
      signal: AbortSignal;
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

      while (true) {
        const decision = await database.transaction(async (tx) => {
          const [record] = await tx
            .select()
            .from(vanguardReports)
            .where(eq(vanguardReports.operationId, request.operationId))
            .for("update");
          if (!record || record.payloadHash !== payloadHash)
            throw new VanguardError("IDEMPOTENCY_CONFLICT", 409);
          if (record.notifiedAt) return { kind: "complete" as const };

          const now = new Date();
          const activeClaim =
            record.notificationClaimToken &&
            record.notificationClaimedAt &&
            now.getTime() - record.notificationClaimedAt.getTime() < NOTIFICATION_CLAIM_LEASE_MS;
          if (activeClaim) {
            return {
              kind: "wait" as const,
              claimToken: record.notificationClaimToken,
            };
          }

          if (
            record.notificationStartedAt &&
            now.getTime() - record.notificationStartedAt.getTime() >= NOTIFICATION_RETRY_WINDOW_MS
          ) {
            return {
              kind: "error" as const,
              error: new VanguardError("REPORT_NOTIFICATION_REVIEW_REQUIRED", 503),
            };
          }

          const claimToken = randomUUID();
          await tx
            .update(vanguardReports)
            .set({
              notificationStartedAt: record.notificationStartedAt ?? now,
              notificationClaimToken: claimToken,
              notificationClaimedAt: now,
            })
            .where(eq(vanguardReports.id, record.id));
          return {
            kind: "send" as const,
            claimToken,
            id: record.id,
            reason: record.reason,
            createdAt: record.createdAt,
          };
        });

        if (decision.kind === "complete") return { received: true as const };
        if (decision.kind === "error") throw decision.error;

        if (decision.kind === "wait") {
          while (true) {
            await delay(NOTIFICATION_WAIT_POLL_MS);
            const [record] = await database
              .select()
              .from(vanguardReports)
              .where(eq(vanguardReports.operationId, request.operationId));
            if (!record || record.payloadHash !== payloadHash)
              throw new VanguardError("IDEMPOTENCY_CONFLICT", 409);
            if (record.notifiedAt) return { received: true as const };

            const sameClaimStillActive =
              record.notificationClaimToken === decision.claimToken &&
              record.notificationClaimedAt &&
              Date.now() - record.notificationClaimedAt.getTime() < NOTIFICATION_CLAIM_LEASE_MS;
            if (!sameClaimStillActive) break;
          }
          continue;
        }

        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), NOTIFICATION_PROVIDER_TIMEOUT_MS);
        try {
          await input.notify({
            seatId: request.seatId,
            reason: decision.reason,
            timestamp: decision.createdAt.toISOString(),
            idempotencyKey: `vanguard-report/${decision.id}`,
            signal: controller.signal,
          });
        } catch {
          await database.transaction(async (tx) => {
            const [record] = await tx
              .select()
              .from(vanguardReports)
              .where(eq(vanguardReports.operationId, request.operationId))
              .for("update");
            if (record?.notificationClaimToken === decision.claimToken && !record.notifiedAt) {
              await tx
                .update(vanguardReports)
                .set({
                  notificationClaimToken: null,
                  notificationClaimedAt: null,
                })
                .where(eq(vanguardReports.id, record.id));
            }
          });
          throw new VanguardError("REPORT_NOTIFICATION_FAILED", 503);
        } finally {
          clearTimeout(timeout);
        }

        const finalized = await database.transaction(async (tx) => {
          const [record] = await tx
            .select()
            .from(vanguardReports)
            .where(eq(vanguardReports.operationId, request.operationId))
            .for("update");
          if (!record || record.payloadHash !== payloadHash)
            throw new VanguardError("IDEMPOTENCY_CONFLICT", 409);
          if (record.notifiedAt) return true;
          if (record.notificationClaimToken !== decision.claimToken) return false;
          await tx
            .update(vanguardReports)
            .set({
              notifiedAt: new Date(),
              notificationClaimToken: null,
              notificationClaimedAt: null,
            })
            .where(eq(vanguardReports.id, record.id));
          return true;
        });
        if (finalized) return { received: true as const };
      }
    },
  };
}
