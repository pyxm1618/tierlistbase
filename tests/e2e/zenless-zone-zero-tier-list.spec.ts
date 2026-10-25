import { expect, test } from "@playwright/test";

import { routeRegistry } from "@/config/routes.config";

const route = "/zenless-zone-zero/tier-list";

test("ZZZ SEO pre-closeout stays noindex with the approved metadata", async ({ page }) => {
  await page.goto(route);

  await expect(page).toHaveTitle("ZZZ Tier List – Best Zenless Zone Zero Characters Ranked");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute(
    "content",
    "Explore the Zenless Zone Zero Tier List with current character rankings, best characters and agents, team-building insights, and pull decisions.",
  );
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute("content", /noindex/);
  await expect(page.locator('link[rel="canonical"]')).toHaveCount(0);

  const h1 = page.getByRole("heading", { level: 1 });
  await expect(h1).toHaveCount(1);
  await expect(h1).toHaveText("ZZZ Tier List");

  expect(routeRegistry.sitemapEntries().map((entry) => entry.route)).not.toContain(route);
});

test("ZZZ page-level SEO copy keeps the approved keyword group density", async ({ page }) => {
  await page.goto(route);

  const heroCopy = await page
    .getByRole("heading", { level: 1, name: "ZZZ Tier List" })
    .locator("..")
    .innerText();

  const pullSummary = page.getByRole("region", { name: "Current Pull Advice", exact: true });
  const pullSummaryCopy = (await pullSummary.innerText())
    .split("\n")
    .filter(Boolean)
    .slice(0, 2)
    .join(" ");

  const agentRegion = page.getByRole("region", { name: "Agent Ranking", exact: true });
  const agentCopy = await agentRegion
    .getByRole("heading", { level: 2, name: "ZZZ Character Tier List" })
    .locator("..")
    .innerText();

  const primary = page.locator('nav[aria-label="Tier list primary sections"]');
  await primary.getByRole("tab", { name: /^Teams/ }).click();
  const teamRegion = page.getByRole("region", { name: "Team Ranking", exact: true });
  const teamCopy = await teamRegion
    .getByRole("heading", { level: 2, name: "Team Ranking" })
    .locator("..")
    .innerText();

  await primary.getByRole("tab", { name: /^Pull Advice/ }).click();
  const pullDetail = page.getByRole("region", { name: "Pull Advice Detail", exact: true });
  await pullDetail.getByRole("button", { name: "Close Pull Advice Detail" }).click();
  const pullRegion = page.getByRole("region", { name: "Pull Advice", exact: true });
  const pullCopy = await pullRegion
    .getByRole("heading", { level: 2, name: "Current Pull Advice" })
    .locator("..")
    .innerText();

  const visibleMainCopy = [heroCopy, pullSummaryCopy, agentCopy, teamCopy, pullCopy]
    .join(" ")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
  const wordCount = visibleMainCopy.match(/[a-z0-9]+(?:[-'][a-z0-9]+)*/g)?.length ?? 0;
  const phrases = [
    "zzz tier list",
    "zzz character tier list",
    "zenless zone zero tier list",
    "zenless zone zero character tier list",
  ] as const;
  const counts = Object.fromEntries(
    phrases.map((phrase) => [phrase, visibleMainCopy.split(phrase).length - 1]),
  ) as Record<(typeof phrases)[number], number>;
  const combinedOccurrences = phrases.reduce((total, phrase) => total + counts[phrase], 0);
  const combinedDensity = (combinedOccurrences / wordCount) * 100;

  expect(wordCount).toBe(145);
  expect(counts["zzz tier list"]).toBe(3);
  expect(counts["zzz character tier list"]).toBe(1);
  expect(counts["zenless zone zero tier list"]).toBe(1);
  expect(counts["zenless zone zero character tier list"]).toBe(1);
  expect(combinedDensity).toBeGreaterThanOrEqual(3);
  expect(combinedDensity).toBeLessThanOrEqual(5);
  expect(counts["zzz tier list"]).toBeGreaterThan(counts["zzz character tier list"]);
  expect(counts["zzz tier list"]).toBeGreaterThan(counts["zenless zone zero tier list"]);
  expect(counts["zzz tier list"]).toBeGreaterThan(
    counts["zenless zone zero character tier list"],
  );
});

test("ZZZ uses the shared marketing shell and preserves the frozen decision architecture", async ({
  page,
}) => {
  await page.goto(route);

  await expect(page.locator('header nav[aria-label="Primary navigation"]')).toBeVisible();
  await expect(page.locator('footer nav[aria-label="Footer navigation"]')).toBeVisible();
  await expect(page.locator('nav[aria-label="ZZZ page utility navigation"]')).toHaveCount(0);

  await expect(page.getByRole("heading", { level: 1 })).toHaveText("ZZZ Tier List");

  const primary = page.locator('nav[aria-label="Tier list primary sections"]');
  const agentsTab = primary.getByRole("tab", { name: /^Agents/ });
  const teamsTab = primary.getByRole("tab", { name: /^Teams/ });
  const pullTab = primary.getByRole("tab", { name: /^Pull Advice/ });

  await expect(agentsTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("region", { name: "Agent Ranking", exact: true })).toBeVisible();
  await expect(
    page.getByRole("complementary", { name: "Agent Detail", exact: true }),
  ).toBeVisible();

  await page.getByRole("searchbox", { name: "Search agents" }).fill("Miyabi");
  await expect(page.getByRole("button", { name: /Miyabi, S\+ tier/ })).toBeVisible();

  await page.getByRole("combobox", { name: "Attribute" }).selectOption("Frost");
  await expect(page.getByRole("button", { name: /Miyabi, S\+ tier/ })).toBeVisible();

  await teamsTab.click();
  await expect(teamsTab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("region", { name: "Team Ranking", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Agent Ranking", exact: true })).toHaveCount(0);

  const teamDetail = page.getByRole("region", { name: "Team Detail", exact: true });
  await expect(teamDetail).toBeVisible();
  await teamDetail.getByRole("button", { name: "Close Team Detail" }).click();
  await page.locator("button").filter({ hasText: "Evelyn Hypercarry" }).first().click();
  await expect(teamDetail).toBeVisible();
  await expect(teamDetail).toContainText("Evelyn Hypercarry");
  await expect(teamDetail).toContainText("Team Compositions");
  await expect(teamDetail).toContainText("Best Bangboo");
  await teamDetail.getByRole("button", { name: "Close Team Detail" }).click();

  await pullTab.click();
  await expect(pullTab).toHaveAttribute("aria-selected", "true");
  const pullDetail = page.getByRole("region", { name: "Pull Advice Detail", exact: true });
  await expect(pullDetail).toBeVisible();
  await expect(pullDetail).toContainText("Pull If");
  await expect(pullDetail).toContainText("Best For Which Accounts");

  await pullDetail.getByRole("tab", { name: "Investment", exact: true }).click();
  await expect(pullDetail).toContainText("Signature W-Engine Importance");

  await pullDetail.getByRole("tab", { name: "Alternatives", exact: true }).click();
  await expect(pullDetail).toContainText("Alternatives");
});

for (const width of [390, 1440]) {
  test(`ZZZ remains within the viewport at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
  });
}

for (const width of [390, 1440]) {
  test(`ZZZ reuses local agent and Bangboo icons at ${width}px`, async ({ page }) => {
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.getByRole("button", { name: "Close Team Detail" }).click();
    await page.getByRole("button", { name: "Close Pull Advice Detail" }).click();
    const names = [
      "Evelyn",
      "Astra",
      "Jane",
      "Zhu Yuan",
      "Harumasa",
      "Yanagi",
      "Caesar",
      "Burnice",
      "Qingyi",
      "Lighter",
      "Soukaku",
      "Nicole",
      "Rina",
      "Anby",
      "Nekomata",
      "Piper",
      "Ben",
      "Anton",
      "Billy",
      "Lucy",
      "Corin",
      "Seth",
    ];
    const ranking = page.getByRole("region", { name: "Agent Ranking", exact: true });
    const detail = page.getByRole("complementary", { name: "Agent Detail", exact: true });
    for (const name of names) {
      const card = ranking.getByRole("button", { name: new RegExp(`^${name},`) });
      const icon = card.getByRole("img", { name, exact: true });
      await expect(icon).toHaveAttribute("src", /\/_next\/image\?/);
      await expect(icon).toHaveAttribute(
        "src",
        new RegExp(name.toLowerCase().replaceAll(" ", "-")),
      );
      await card.click();
      await expect(detail.getByRole("img", { name, exact: true })).toHaveAttribute(
        "src",
        (await icon.getAttribute("src")) ?? "",
      );
      await expect(detail.locator('[data-kind="portrait"]')).toHaveCount(0);
      await expect(detail.locator('[data-kind="hero"]')).toHaveCount(1);
      await expect(detail.locator('[data-kind="item"]')).toHaveCount(3);
    }
    await expect(ranking.locator('[data-kind="portrait"]')).toHaveCount(0);
    const summary = page.getByRole("region", { name: "Current Pull Advice", exact: true });
    for (const name of ["Harumasa", "Evelyn"]) {
      const icon = summary.getByRole("img", { name, exact: true });
      await expect(icon).toHaveAttribute("src", new RegExp(name.toLowerCase()));
      await icon.click();
      const pull = page.getByRole("region", { name: "Pull Advice Detail", exact: true });
      await expect(pull.getByRole("img", { name, exact: true })).toHaveAttribute(
        "src",
        (await icon.getAttribute("src")) ?? "",
      );
      await pull.getByRole("button", { name: "Close Pull Advice Detail" }).click();
    }
    await page
      .locator('nav[aria-label="Tier list primary sections"]')
      .getByRole("tab", { name: /^Teams/ })
      .click();
    const teamDetail = page.getByRole("region", { name: "Team Detail", exact: true });
    for (const [team, icons] of [
      ["Miyabi Freeze", ["Sharkboo", "Butlerboo", "Rocketboo"]],
      ["Evelyn Hypercarry", ["Rocketboo", "Cryboo"]],
      ["Harumasa Quicken", ["Plugboo", "Electroboo"]],
    ] as const) {
      if (await teamDetail.isVisible())
        await teamDetail.getByRole("button", { name: "Close Team Detail" }).click();
      await page
        .getByRole("region", { name: "Team Ranking", exact: true })
        .getByRole("button")
        .filter({ hasText: team })
        .click();
      for (const name of icons) {
        const icon = teamDetail.getByRole("img", { name, exact: true });
        await expect(icon).toBeVisible();
        await expect(icon).toHaveAttribute("src", new RegExp(name.toLowerCase()));
        await expect(icon).toHaveCSS("object-fit", "contain");
      }
      await expect(teamDetail.locator('[data-kind="portrait"], [data-kind="item"]')).toHaveCount(0);
      const teamCard = page
        .getByRole("region", { name: "Team Ranking", exact: true })
        .getByRole("button")
        .filter({ hasText: team });
      const bannerName = `team-${team.toLowerCase().replaceAll(" ", "-")}`;
      for (const [location, container] of [
        ["card", teamCard],
        ["detail", teamDetail],
      ] as const) {
        await expect(container.locator('[data-kind="team"]')).toHaveCount(0);
        const banner = container.locator('img[alt=""]');
        await expect(banner).toHaveAttribute("src", new RegExp(bannerName));
        await expect(banner).toHaveCSS("object-fit", "cover");
        await banner.scrollIntoViewIfNeeded();
        await expect
          .poll(() =>
            banner.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0),
          )
          .toBe(true);
        await container.screenshot({
          path: test.info().outputPath(`${bannerName}-${location}-${width}.png`),
        });
      }
      await expect(teamDetail.locator('img[alt=""]')).toHaveAttribute(
        "src",
        (await teamCard.locator('img[alt=""]').getAttribute("src")) ?? "",
      );
      await page.screenshot({ path: test.info().outputPath(`${bannerName}-${width}.png`) });
      if (team === "Miyabi Freeze")
        await expect(teamDetail.getByText("Butlerboo / Rocketboo", { exact: true })).toBeVisible();
      for (const icon of await teamDetail.locator("img[alt]").all()) {
        const name = await icon.getAttribute("alt");
        if (names.includes(name ?? "")) {
          await expect(icon).toHaveAttribute(
            "src",
            new RegExp((name ?? "").toLowerCase().replaceAll(" ", "-")),
          );
        }
      }
      await expect
        .poll(() =>
          teamDetail
            .locator('img[alt]:not([alt=""])')
            .evaluateAll((images) =>
              images.every(
                (image) =>
                  (image as HTMLImageElement).complete &&
                  (image as HTMLImageElement).naturalWidth > 0,
              ),
            ),
        )
        .toBe(true);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
        true,
      );
    }
  });
}
