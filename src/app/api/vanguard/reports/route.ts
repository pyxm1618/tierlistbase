import {
  createVanguardReportService,
  reportSchema,
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
    const service = createVanguardReportService(db, {
      notify: async (report) => {
        if (!env.supportEmail) throw new Error("Vanguard support address is unavailable");
        const sender = await getEmailSender();
        const link = `${env.appOrigin}${vanguardSeatLink(report.seatId)}`;
        await sender.send(
          {
            idempotencyKey: report.idempotencyKey,
            to: env.supportEmail,
            template: "vanguard-report",
            subject: `Vanguard report: ${report.seatId}`,
            html: `<p>Seat ID: ${report.seatId}</p><p>Reason: ${report.reason}</p><p>Timestamp: ${report.timestamp}</p><p><a href="${link}">Public Seat Link</a></p>`,
          },
          { signal: report.signal },
        );
      },
    });
    return json(await service.report(context?.user.id ?? null, input), 201);
  });
}
