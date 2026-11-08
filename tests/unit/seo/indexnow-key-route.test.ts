import { beforeEach, describe, expect, it, vi } from "vitest";

const state = vi.hoisted(() => ({
  env: {
    indexNowKey: undefined as string | undefined,
  },
}));

vi.mock("@/platform/config/env", () => ({
  env: state.env,
}));

import { GET } from "@/app/indexnow-key.txt/route";

describe("IndexNow key endpoint", () => {
  beforeEach(() => {
    state.env.indexNowKey = undefined;
  });

  it("returns 404 without INDEXNOW_KEY", async () => {
    const response = await GET();

    expect(response.status).toBe(404);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe("Not Found");
  });

  it("returns the exact configured key as plain text", async () => {
    state.env.indexNowKey = "IndexNow-Key-12345";

    const response = await GET();

    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toBe("text/plain; charset=utf-8");
    expect(await response.text()).toBe("IndexNow-Key-12345");
  });
});
