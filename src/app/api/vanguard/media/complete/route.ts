import { z } from "zod";
import { getVanguardMediaService } from "@/config/vanguard-runtime.config";
import { body, boundary, json, respond } from "../../_runtime";
export const runtime = "nodejs";
export function POST(request: Request) {
  return respond(async () => {
    const context = await boundary(request, "media-complete", true, true);
    const input = await body(request, z.object({ mediaId: z.uuid() }).strict());
    return json(await getVanguardMediaService().complete(context!.user.id, input.mediaId));
  });
}
