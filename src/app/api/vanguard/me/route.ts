import { boundary, json, respond, vanguard } from "../_runtime";
export function GET(request: Request) {
  return respond(async () => {
    const context = await boundary(request, "me", false, true);
    return json({ inscription: await vanguard.me(context!.user.id) });
  });
}
