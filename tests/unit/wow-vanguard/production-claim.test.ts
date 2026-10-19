import { afterEach, expect, it, vi } from "vitest";
const runtime = vi.hoisted(() => ({
  appEnv: "production",
  appOrigin: "https://www.tierlistbase.com",
}));
vi.mock("server-only", () => ({}));
vi.mock("@/platform/config/env", () => ({ env: runtime }));
vi.mock("@/platform/database/application-database", () => ({ db: {} }));
vi.mock("@/modules/wow-vanguard", async (importOriginal) => {
  const original = await importOriginal<typeof import("@/modules/wow-vanguard")>();
  return { ...original, createVanguardService: vi.fn((_database, options) => options) };
});
afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
  runtime.appEnv = "production";
});
it("keeps production Claim closed even if all test flags are set", async () => {
  vi.stubEnv("CREAT_WEB_E2E_VANGUARD", "1");
  vi.stubEnv("VANGUARD_E2E_LAYOUT_ORIGIN", "http://127.0.0.1:3199");
  const fetcher = vi.fn();
  vi.stubGlobal("fetch", fetcher);
  const { getVanguardService } = await import("@/config/vanguard-runtime.config");
  const { createVanguardService } = await import("@/modules/wow-vanguard");
  getVanguardService();
  const options = vi.mocked(createVanguardService).mock.calls.at(-1)![1]!;
  await expect(options.seatExists!("WOW-W1-0001")).rejects.toMatchObject({
    code: "LAYOUT_UNAVAILABLE",
  });
  expect(fetcher).not.toHaveBeenCalled();
});
it("allows the explicitly opted-in loopback fixture only in test runtime", async () => {
  runtime.appEnv = "test";
  vi.stubEnv("CREAT_WEB_E2E_VANGUARD", "1");
  vi.stubEnv("VANGUARD_E2E_LAYOUT_ORIGIN", "http://127.0.0.1:3199");
  const fetcher = vi.fn(async (url: RequestInfo | URL) => {
    expect(String(url)).toContain("http://127.0.0.1:3199/__vanguard_test__/");
    return new Response(new Uint8Array(2672 * 16));
  });
  vi.stubGlobal("fetch", fetcher);
  const { getVanguardService } = await import("@/config/vanguard-runtime.config");
  const { createVanguardService } = await import("@/modules/wow-vanguard");
  getVanguardService();
  const options = vi.mocked(createVanguardService).mock.calls.at(-1)![1]!;
  await expect(options.seatExists!("WOW-W1-0001")).resolves.toBe(true);
  expect(fetcher).toHaveBeenCalledTimes(3);
});
