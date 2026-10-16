import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/modules/genshin-tier-list", () => ({
  loadGenshinData: async () => ({ status: "unavailable" }),
  genshinStyles: { page: "page", shell: "shell" },
}));
import GenshinPage, { generateMetadata } from "@/app/(marketing)/genshin-impact/tier-list/page";
import { routeRegistry } from "@/config/routes.config";

it("renders a truthful unavailable state without fixtures or database error details", async () => {
  const html = renderToStaticMarkup(await GenshinPage());
  expect(html).toContain("Reviewed ranking data is currently unavailable. Please try again later.");
  expect(html).toContain('role="status"');
  expect(html).not.toMatch(/Mock|data-character-card|DATABASE_URL|postgres/i);
});

it("follows the route registry under the production metadata policy", async () => {
  vi.stubEnv("APP_ENV", "production");
  try {
    const route = routeRegistry.get("/genshin-impact/tier-list");
    expect(await generateMetadata()).toMatchObject({
      robots: { index: route.class === "public_indexable", follow: true },
    });
  } finally {
    vi.unstubAllEnvs();
  }
});
