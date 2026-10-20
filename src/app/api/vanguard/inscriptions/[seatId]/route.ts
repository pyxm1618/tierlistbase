import { seatIdSchema } from "@/modules/wow-vanguard";
import { boundary, json, respond, vanguard } from "../../_runtime";
export function GET(request: Request, context: { params: Promise<{ seatId: string }> }) {
  return respond(async () => {
    await boundary(request, "focus");
    const { seatId } = await context.params;
    const result = await vanguard.focus(seatIdSchema.parse(seatId));
    return result
      ? json(result, 200, "public, max-age=5, must-revalidate")
      : json({ error: { code: "SEAT_NOT_FOUND" } }, 404);
  });
}
