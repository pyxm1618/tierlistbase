import { boundary, json, respond, vanguard } from "../_runtime";
export const dynamic = "force-dynamic";
export function GET(request: Request) {
  return respond(async () => {
    await boundary(request, "manifest");
    const result = await vanguard.manifest();
    const etag = `"${result.version}"`;
    const headers = { ETag: etag, "Cache-Control": "public, max-age=5, must-revalidate" };
    if (request.headers.get("if-none-match") === etag)
      return new Response(null, { status: 304, headers });
    const response = json(result, 200, headers["Cache-Control"]);
    response.headers.set("ETag", etag);
    return response;
  });
}
