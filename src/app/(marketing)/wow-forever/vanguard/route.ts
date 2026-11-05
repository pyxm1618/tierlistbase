const retiredHeaders = {
  "cache-control": "public, max-age=0, s-maxage=86400",
  "content-type": "text/plain; charset=utf-8",
  "x-robots-tag": "noindex, nofollow",
} as const;

export function GET(): Response {
  return new Response("Gone", {
    status: 410,
    headers: retiredHeaders,
  });
}

export function HEAD(): Response {
  return new Response(null, {
    status: 410,
    headers: retiredHeaders,
  });
}
