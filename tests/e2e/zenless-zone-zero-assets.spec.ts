import { readFileSync } from "node:fs";

import { expect, test, type Locator, type Page } from "@playwright/test";

import { agents, teams } from "@/modules/zenless-zone-zero-tier-list/data";

const route = "/zenless-zone-zero/tier-list";
const manifest = JSON.parse(
  readFileSync(new URL("../../zzz-asset-manifest.json", import.meta.url), "utf8"),
) as { agentDetailArtwork: { entityId: string; verified: boolean }[] };
const approvedHeroes = new Set(
  manifest.agentDetailArtwork.filter((entry) => entry.verified).map((entry) => entry.entityId),
);
const pending = (kind: string) => `[data-asset-pending="true"][data-kind="${kind}"]`;

async function expectLoadedImages(images: Locator, count: number) {
  await expect(images).toHaveCount(count);
  await expect
    .poll(() =>
      images.evaluateAll((elements) =>
        elements.every((image) => {
          const img = image as HTMLImageElement;
          return img.complete && img.naturalWidth > 0;
        }),
      ),
    )
    .toBe(true);
}

async function closeAuxiliaryDetails(page: Page) {
  for (const name of ["Pull Advice Detail", "Team Detail"]) {
    const panel = page.getByRole("region", { name, exact: true });
    if (await panel.isVisible()) {
      await panel.getByRole("button", { name: `Close ${name}`, exact: true }).click();
    }
  }
}

test("ZZZ renders all released portraits/build items and every team without P0 fallbacks", async ({
  page,
}) => {
  test.setTimeout(180_000);
  await page.goto(route);
  await closeAuxiliaryDetails(page);
  const ranking = page.getByRole("region", { name: "Agent Ranking", exact: true });
  const detail = page.getByRole("complementary", { name: "Agent Detail", exact: true });
  await expect(ranking.locator("button[aria-pressed]")).toHaveCount(61);
  await expect(ranking.locator(pending("portrait"))).toHaveCount(0);
  for (const agent of agents) {
    await ranking
      .getByRole("button", {
        name: `${agent.name}, ${agent.tier} tier, ${agent.combatRole}`,
        exact: true,
      })
      .click();
    await expect(detail.getByRole("heading", { name: agent.name, exact: true })).toBeVisible();
    await expect(detail.locator(pending("portrait"))).toHaveCount(0);
    await expect(detail.locator(pending("item"))).toHaveCount(0);
    const portrait = detail.getByRole("img", { name: agent.name, exact: true });
    await portrait.scrollIntoViewIfNeeded();
    await expectLoadedImages(portrait, 1);
    const engines = detail.locator('img[width="35"][height="35"]');
    await engines.first().scrollIntoViewIfNeeded();
    await expectLoadedImages(engines, 3);
    await expect(detail.locator(pending("hero"))).toHaveCount(approvedHeroes.has(agent.id) ? 0 : 1);
  }
  const primary = page.locator('nav[aria-label="Tier list primary sections"]');
  await primary.getByRole("tab", { name: /^Teams/ }).click();
  const teamRanking = page.getByRole("region", { name: "Team Ranking", exact: true });
  const teamDetail = page.getByRole("region", { name: "Team Detail", exact: true });
  await expect(teamRanking.locator(pending("team"))).toHaveCount(0);
  for (const team of teams) {
    await teamRanking
      .getByRole("button")
      .filter({ has: page.getByText(team.name, { exact: true }) })
      .click();
    await expect(teamDetail.locator(pending("team"))).toHaveCount(0);
    await expect(teamDetail.locator(pending("portrait"))).toHaveCount(0);
    await expect(teamDetail.locator(pending("item"))).toHaveCount(0);
    const visual = teamDetail.locator("[data-detail-kind=team] img");
    await visual.scrollIntoViewIfNeeded();
    await expectLoadedImages(visual, 1);
    const bangboo = teamDetail.locator('img[width="35"][height="35"]');
    await bangboo.first().scrollIntoViewIfNeeded();
    await expectLoadedImages(bangboo, 2);
    for (const portrait of await teamDetail.locator('img[sizes="48px"]').all()) {
      await portrait.scrollIntoViewIfNeeded();
      await expectLoadedImages(portrait, 1);
    }
  }
  await primary.getByRole("tab", { name: /^Pull Advice/ }).click();
  const summary = page.getByRole("region", { name: "Current Pull Advice", exact: true });
  await expect(summary.locator(pending("portrait"))).toHaveCount(1);
  const pullDetail = page.getByRole("region", { name: "Pull Advice Detail", exact: true });
  await expect(pullDetail.locator(pending("portrait"))).toHaveCount(0);
  await pullDetail.getByRole("button", { name: "Close Pull Advice Detail" }).click();
  const upcoming = summary.getByRole("button", { name: /^Upcoming/ });
  await expect(upcoming).toHaveCount(1);
  await upcoming.click();
  // Only the explicitly unapproved Upcoming Agent retains a portrait fallback.
  await expect(pullDetail.locator(pending("portrait"))).toHaveCount(1);
});

for (const width of [390, 1440]) {
  test(`ZZZ approved images fit existing containers at ${width}px`, async ({ page }, testInfo) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await closeAuxiliaryDetails(page);
    const ranking = page.getByRole("region", { name: "Agent Ranking", exact: true });
    await ranking.getByRole("button", { name: /^Phoenix,/ }).click();
    const detail = page.getByRole("complementary", { name: "Agent Detail", exact: true });
    await detail.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expectLoadedImages(detail.locator('img[width="35"][height="35"]'), 3);
    for (const image of await detail.locator('img[width="35"][height="35"]').all()) {
      const box = await image.boundingBox();
      expect(box?.width).toBe(35);
      expect(box?.height).toBe(35);
    }
    await expect(detail.locator(pending("portrait"))).toHaveCount(0);
    await expect(detail.locator(pending("hero"))).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await page.screenshot({ path: testInfo.outputPath(`zzz-assets-${width}-agent.png`) });

    const primary = page.locator('nav[aria-label="Tier list primary sections"]');
    await primary.getByRole("tab", { name: /^Teams/ }).click();
    const teamDetail = page.getByRole("region", { name: "Team Detail", exact: true });
    await teamDetail.evaluate((element) => element.scrollIntoView({ block: "start" }));
    await expectLoadedImages(teamDetail.locator('img[width="35"][height="35"]'), 2);
    await expect(teamDetail.locator(pending("team"))).toHaveCount(0);
    const images = teamDetail.locator("img");
    await expect
      .poll(() =>
        images.evaluateAll((elements) =>
          elements
            .filter((image) => {
              const box = image.getBoundingClientRect();
              return box.top < innerHeight && box.bottom > 0;
            })
            .every(
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
    await page.screenshot({ path: testInfo.outputPath(`zzz-assets-${width}-team.png`) });
  });
}
