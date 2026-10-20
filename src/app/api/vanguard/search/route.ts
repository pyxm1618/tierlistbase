import { searchSchema } from "@/modules/wow-vanguard";
import { boundary, json, respond, vanguard } from "../_runtime";
export function GET(request: Request) {
  return respond(async () => {
    await boundary(request, "search");
    const input = searchSchema.parse(Object.fromEntries(new URL(request.url).searchParams));
    return json({ results: await vanguard.search(input.q) });
  });
}
