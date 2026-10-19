import { eq } from "drizzle-orm";
import {
  reportSchema,
  vanguardInscriptions,
  vanguardReports,
  VanguardError,
  vanguardSeatLink,
} from "@/modules/wow-vanguard";
import { db } from "@/platform/database/application-database";
import { env } from "@/platform/config/env";
import { getEmailSender } from "@/platform/email/email-runtime";
import { body, boundary, json, respond } from "../_runtime";
export function POST(request: Request) {
  return respond(async () => {
    const context = await boundary(request, "reports", true);
    const input = await body(request, reportSchema);
    const [seat] = await db
      .select({
        id: vanguardInscriptions.id,
        status: vanguardInscriptions.status,
        userId: vanguardInscriptions.userId,
      })
      .from(vanguardInscriptions)
      .where(eq(vanguardInscriptions.seatId, input.seatId))
      .limit(1);
    if (!seat || seat.status !== "active" || !seat.userId)
      throw new VanguardError("SEAT_NOT_FOUND", 404);
    const sender = await getEmailSender();
    if (!env.supportEmail) throw new VanguardError("SERVICE_UNAVAILABLE", 503);
    const [report] = await db
      .insert(vanguardReports)
      .values({
        inscriptionId: seat.id,
        reporterUserId: context?.user.id ?? null,
        reason: input.reason,
      })
      .returning({ createdAt: vanguardReports.createdAt });
    if (!report) throw new Error("Vanguard report insert returned no record");
    const link = `${env.appOrigin}${vanguardSeatLink(input.seatId)}`;
    try {
      await sender.send({
        to: env.supportEmail,
        template: "vanguard-report",
        subject: `Vanguard report: ${input.seatId}`,
        html: `<p>Seat ID: ${input.seatId}</p><p>Reason: ${input.reason}</p><p>Timestamp: ${report.createdAt.toISOString()}</p><p><a href="${link}">Public Seat Link</a></p>`,
      });
    } catch {
      throw new VanguardError("REPORT_NOTIFICATION_FAILED", 503);
    }
    return json({ received: true }, 201);
  });
}
