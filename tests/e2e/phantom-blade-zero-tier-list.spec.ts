import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import path from "node:path";

import { expect, test } from "@playwright/test";
import * as prettier from "prettier";

test.describe("Phantom Blade Zero tier list preview", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/phantom-blade-zero/tier-list");
  });

  test("switches ranking modes and updates detail content", async ({ page }) => {
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Phantom Blade Zero Tier List",
    );
    await expect(page.getByTestId("p0-release-gate")).toContainText("NOT READY");

    await page.getByRole("tab", { name: "Phantom Edges" }).click();
    await page.getByRole("button", { name: /Dread Axe/ }).click();
    await expect(page.getByRole("heading", { name: "Dread Axe" })).toBeVisible();
    await expect(page.getByText("Iron Chain Breaker", { exact: true })).toBeVisible();
  });

  test("supports search, category filtering, clear, Pending, and Needs Review", async ({
    page,
  }) => {
    await page.getByRole("searchbox", { name: "Search main weapons" }).fill("Seamless");
    await expect(page.getByRole("button", { name: /Seamless Death/ })).toBeVisible();
    await expect(page.locator('[aria-label="Pending tier"]')).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await page.getByRole("tab", { name: "Phantom Edges" }).click();
    await page.getByRole("searchbox", { name: "Search Phantom Edges" }).fill("Hunter");
    await expect(page.getByRole("button", { name: /Hunter’s Chain Sickle/ })).toBeVisible();

    await page.getByLabel("Filter by category").selectOption("Martial");
    await expect(page.getByRole("button", { name: /Hunter’s Chain Sickle/ })).toBeVisible();
    await expect(page.locator('[aria-label="Needs Review tier"]')).toBeVisible();

    await page.getByRole("button", { name: "Clear filters" }).click();
    await expect(page.getByRole("button", { name: /Thunder Spear/ })).toBeVisible();
  });

  test("keeps keyboard interaction and mobile layout usable", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.getByRole("tab", { name: "Phantom Edges" }).focus();
    await page.keyboard.press("Enter");
    await page.getByRole("button", { name: /Thunder Spear/ }).focus();
    await page.keyboard.press("Enter");
    await expect(page.getByRole("heading", { name: "Thunder Spear" })).toBeVisible();

    expect(
      await page.evaluate(() => document.documentElement.scrollWidth > innerWidth),
    ).toBe(false);
  });

  for (const width of [390, 768, 1440]) {
    test(`has no horizontal overflow at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.reload();
      expect(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth)).toBe(
        false,
      );
    });
  }

  test("does not hotlink or render placeholder images while P0 binaries are missing", async ({
    page,
  }) => {
    await expect(page.locator("main img")).toHaveCount(0);
    await expect(page.getByText(/image is intentionally omitted/i).first()).toBeVisible();
  });
});

test("diagnostic: print exact Prettier diffs for PBZ files", async () => {
  const files = [
    "src/modules/phantom-blade-zero-tier-list/asset-provenance.ts",
    "src/modules/phantom-blade-zero-tier-list/data.ts",
    "src/modules/phantom-blade-zero-tier-list/phantom-blade-zero-tier-list.tsx",
    "tests/e2e/phantom-blade-zero-tier-list.spec.ts",
    "tests/unit/phantom-blade-zero-tier-list/data.test.ts",
  ];

  for (const filePath of files) {
    const input = readFileSync(filePath, "utf8");
    const config = (await prettier.resolveConfig(filePath)) ?? {};
    const formatted = await prettier.format(input, { ...config, filepath: filePath });
    if (formatted === input) {
      console.log(`FORMAT_OK ${filePath}`);
      continue;
    }

    const tempPath = path.join("/tmp", `pbz-prettier-${path.basename(filePath)}`);
    writeFileSync(tempPath, formatted);
    let diff = "";
    try {
      execFileSync("diff", ["-u", filePath, tempPath], { encoding: "utf8" });
    } catch (error) {
      diff = String((error as { stdout?: string }).stdout ?? "");
    }
    console.log(`FORMAT_DIFF_START ${filePath}\n${diff}\nFORMAT_DIFF_END ${filePath}`);
  }
});
