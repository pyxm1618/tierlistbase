import { afterEach, expect, it, vi } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/platform/config/env", () => ({ env: { databaseUrl: "postgres://unused" } }));

const state = vi.hoisted(() => ({
  nextId: 0,
  closed: new Set<number>(),
  connectionLimits: new Map<number, number>(),
}));
vi.mock("@/platform/database/client", () => ({
  createDatabaseClient: (_url: string, maxConnections = 5) => {
    const id = ++state.nextId;
    state.connectionLimits.set(id, maxConnections);
    return {
      db: {
        select() {
          if (state.closed.has(id)) throw new Error("Client closed");
          return id;
        },
      },
      close: async () => {
        state.closed.add(id);
      },
    };
  },
}));

vi.mock("vinext/server/fetch-handler", () => ({
  default: {
    async fetch(request: Request, _env: unknown, ctx: { waitUntil(p: Promise<unknown>): void }) {
      const { db } = await import("@/platform/database/application-database");
      if (new URL(request.url).pathname === "/fail") throw new Error("Query failed");
      if (new URL(request.url).pathname === "/background") {
        ctx.waitUntil(
          new Promise<void>((resolve) =>
            setTimeout(() => {
              db.select();
              resolve();
            }, 20),
          ),
        );
      }
      return new Response(
        new ReadableStream({
          async start(controller) {
            const first = db.select();
            await new Promise((resolve) => setTimeout(resolve, 10));
            controller.enqueue(new TextEncoder().encode(`${first}:${db.select()}`));
            controller.close();
          },
        }),
      );
    },
  },
}));

import worker from "../../../cloudflare-worker";

const pending = new Set<Promise<unknown>>();
const ctx = {
  waitUntil(p: Promise<unknown>) {
    pending.add(p);
  },
};
afterEach(async () => {
  await Promise.allSettled(pending);
  pending.clear();
  state.closed.clear();
});

it("keeps concurrent response streams on separate open request clients and closes both", async () => {
  const responses = await Promise.all([
    worker.fetch(new Request("https://worker.test/one"), {}, ctx),
    worker.fetch(new Request("https://worker.test/two"), {}, ctx),
  ]);
  const bodies = await Promise.all(responses.map((r) => r.text()));
  await Promise.all(pending);
  const ids = bodies.map((body) => body.split(":").map(Number));
  expect(ids[0]![0]).toBe(ids[0]![1]);
  expect(ids[1]![0]).toBe(ids[1]![1]);
  expect(ids[0]![0]).not.toBe(ids[1]![0]);
  expect(state.closed.has(ids[0]![0]!)).toBe(true);
  expect(state.closed.has(ids[1]![0]!)).toBe(true);
});

it("keeps the request client open until background database work completes", async () => {
  const response = await worker.fetch(new Request("https://worker.test/background"), {}, ctx);
  const body = await response.text();
  await Promise.all(pending);
  expect(state.closed.has(Number(body.split(":")[0]))).toBe(true);
});

it("propagates query errors and closes the failed request client", async () => {
  const before = state.nextId;
  await expect(worker.fetch(new Request("https://worker.test/fail"), {}, ctx)).rejects.toThrow(
    "Query failed",
  );
  expect(state.closed.has(before + 1)).toBe(true);
});

it("closes the request client when the response consumer cancels the stream", async () => {
  const before = state.nextId;
  const response = await worker.fetch(new Request("https://worker.test/cancel"), {}, ctx);
  await response.body!.cancel();
  await Promise.allSettled(pending);
  expect(state.closed.has(before + 1)).toBe(true);
});

it.each(["/", "/genshin-impact/tier-list", "/wow-forever/tier-list?role=tank"])(
  "reuses one database connection for the public GET %s",
  async (path) => {
    const response = await worker.fetch(new Request(`https://worker.test${path}`), {}, ctx);
    const body = await response.text();
    const id = Number(body.split(":")[0]);
    expect(state.connectionLimits.get(id)).toBe(1);
  },
);

it.each([
  ["/account", "GET"],
  ["/api/auth/session", "GET"],
  ["/genshin-impact/tier-list", "POST"],
  ["/wow-forever/tier-list/other", "GET"],
])("keeps the existing connection limit for %s %s", async (path, method) => {
  const response = await worker.fetch(
    new Request(`https://worker.test${path}`, { method }),
    {},
    ctx,
  );
  const body = await response.text();
  expect(state.connectionLimits.get(Number(body.split(":")[0]))).toBe(5);
});

