import { z } from "zod";
import { getVanguardMediaService } from "@/config/vanguard-runtime.config";
import { body, boundary, json, respond } from "../../_runtime";
export const runtime = "nodejs";
export function POST(request: Request) {
  return respond(async () => {
    const context = await boundary(request, "media-presign", true, true);
    await body(request, z.object({}).strict());
    return json(await getVanguardMediaService().presign(context!.user.id), 201);
  });
}
