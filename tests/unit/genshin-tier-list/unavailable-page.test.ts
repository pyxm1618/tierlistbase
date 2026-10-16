import { expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";

vi.mock("@/modules/genshin-tier-list", () => ({
  loadGenshinData: async () => ({ status: "unavailable" }),
  genshinStyles: { page: "page", shell: "shell" },
}));
import GenshinPage, { generateMetadata } from "@/app/(marketing)/genshin-impact/tier-list/page";

it("renders a truthful unavailable state without fixtures or database error details", async () => {
  const html = renderToStaticMarkup(await GenshinPage());
  expect(html).toContain("Reviewed ranking data is currently unavailable. Please try again later.");
  expect(html).toContain('role="status"');
  expect(html).not.toMatch(/Mock|data-character-card|DATABASE_URL|postgres/i);
});

it("remains indexable with the production metadata policy", async () => {
  vi.stubEnv("APP_ENV", "production");
  try {
    expect(await generateMetadata()).toMatchObject({ robots: { index: true, follow: true } });
  } finally {
    vi.unstubAllEnvs();
  }
});
