import { inscriptionSchema } from "@/modules/wow-vanguard";
import { body, boundary, json, respond, vanguard } from "../_runtime";
export function POST(request: Request) {
  return respond(async () => {
    const context = await boundary(request, "inscriptions", true, true);
    const input = await body(request, inscriptionSchema);
    return json(await vanguard.inscribe(context!.user.id, input), 201);
  });
}
