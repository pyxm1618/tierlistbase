// Synthetic layout transport for isolated non-visual E2E only. Nothing is written
// to public/, and production ignores this origin. These are not final Mask coordinates.
import { createServer } from "node:http";
import { spawn } from "node:child_process";
const fixture = createServer((request, response) => {
  const match = /^\/__vanguard_test__\/(wow|forever)-([A-Z][12]?)\.f32$/.exec(request.url ?? "");
  if (request.method !== "GET" || !match) {
    response.writeHead(404).end();
    return;
  }
  const phase = match[1]!;
  const letter = match[2]!;
  const letters = phase === "wow" ? ["W1", "O", "W2"] : ["F", "O", "R1", "E1", "V", "E2", "R2"];
  if (!letters.includes(letter)) {
    response.writeHead(404).end();
    return;
  }
  const count = phase === "wow" ? 2672 : 8016;
  const positions = new Float32Array(count * 4);
  for (let index = 0; index < count; index++) {
    positions[index * 4] = index;
    positions[index * 4 + 1] = letters.indexOf(letter) * 10000;
  }
  response
    .writeHead(200, { "Content-Type": "application/octet-stream", "Cache-Control": "no-store" })
    .end(Buffer.from(positions.buffer));
});
await new Promise<void>((resolve) => fixture.listen(3199, "127.0.0.1", resolve));
const child = spawn("bun", ["tests/e2e/start-enabled-test-server.ts"], {
  stdio: "inherit",
  env: process.env,
});
for (const signal of ["SIGINT", "SIGTERM"] as const)
  process.on(signal, () => {
    child.kill(signal);
    fixture.close();
  });
child.on("exit", (code) => {
  fixture.close();
  process.exitCode = code ?? 1;
});
