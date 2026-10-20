import { holdSchema } from "@/modules/wow-vanguard";
import { body, boundary, json, respond, vanguard } from "../_runtime";
export function POST(request: Request) {
  return respond(async () => {
    const context = await boundary(request, "holds", true);
    const input = await body(request, holdSchema);
    return json(await vanguard.hold(input.seatId, context?.user.id ?? null, input.holdToken));
  });
}
