import { eq } from "drizzle-orm";
import type { z } from "zod";
import type { DatabaseClient } from "@/platform/database/client";
import { reportSchema } from "../domain/validation";
import { VanguardError } from "../domain/event";
import { vanguardInscriptions, vanguardReports } from "./schema";
export function createVanguardReportService(
  database: DatabaseClient,
  input: {
    notify: (report: { seatId: string; reason: string; timestamp: string }) => Promise<void>;
  },
) {
  return {
    async report(reporterUserId: string | null, raw: z.infer<typeof reportSchema>) {
      const request = reportSchema.parse(raw);
      const [seat] = await database
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
      const [record] = await database
        .insert(vanguardReports)
        .values({ inscriptionId: seat.id, reporterUserId, reason: request.reason })
        .returning({ createdAt: vanguardReports.createdAt });
      if (!record) throw new Error("Vanguard report insert returned no record");
      try {
        await input.notify({
          seatId: request.seatId,
          reason: request.reason,
          timestamp: record.createdAt.toISOString(),
        });
      } catch {
        throw new VanguardError("REPORT_NOTIFICATION_FAILED", 503);
      }
      return { received: true };
    },
  };
}
