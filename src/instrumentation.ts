export function onRequestError(
  error: unknown,
  request: { path: string; headers: Record<string, string | string[] | undefined> },
) {
  const causes = [];
  const seen = new Set();
  let current = error;
  while (current instanceof Error && !seen.has(current)) {
    seen.add(current);
    causes.push({
      name: current.name,
      code: "code" in current ? current.code : undefined,
      message: current.message.startsWith("Failed query:")
        ? "Database query failed (SQL and parameters omitted)"
        : current.message.replace(/postgres(?:ql)?:\/\/\S+/g, "[REDACTED]"),
      stack: current.stack?.split("\n").filter((line) => line.trim().startsWith("at ")),
    });
    current = current.cause;
  }
  console.error("WORKER_DATABASE_DIAGNOSTIC", {
    path: request.path,
    probe: request.headers["x-runtime-probe"],
    causes,
  });
}
