import postgres from "postgres";
import { expect, test, type Locator } from "@playwright/test";

import { genshinTestDatabaseUrl, seedGenshinTestDatabase } from "../genshin-tier-list/database";

test.beforeAll(async () => {
  await seedGenshinTestDatabase();
  const database = postgres(genshinTestDatabaseUrl(), { max: 1 });
  try {
    for (const slug of ["nahida", "bennett"]) {
      const avatar = {
        128: `https://media.tierlistbase.com/genshin/characters/${slug}/avatar-128.webp`,
        256: `https://media.tierlistbase.com/genshin/characters/${slug}/avatar-256.webp`,
      };
      await database`update entity_profiles ep set avatar = ${database.json(avatar)}::jsonb
        from entities e join games g on g.id = e.game_id
        where ep.entity_id = e.id and g.slug = 'genshin-impact' and e.slug = ${slug}`;
    }
  } finally {
    await database.end();
  }
});

test.afterAll(async () => {
  const database = postgres(genshinTestDatabaseUrl(), { max: 1 });
  try {
    await database`update entity_profiles ep set avatar = null
      from entities e join games g on g.id = e.game_id
      where ep.entity_id = e.id and g.slug = 'genshin-impact' and e.slug in ('nahida', 'bennett')`;
  } finally {
    await database.end();
  }
  await seedGenshinTestDatabase();
});

async function sample(locator: Locator) {
  await locator.scrollIntoViewIfNeeded();
  await expect(locator).toBeVisible();
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const image = element as HTMLImageElement;
        return image.complete && image.naturalWidth > 0;
      }),
    )
    .toBe(true);
  return locator.evaluate((element) => {
    const image = element as HTMLImageElement;
    const current = new URL(image.currentSrc);
    return {
      currentSrc: image.currentSrc,
      source: decodeURIComponent(current.searchParams.get("url") ?? ""),
      candidateWidth: Number(current.searchParams.get("w")) || null,
      sizes: image.getAttribute("sizes"),
      loading: image.loading,
      naturalWidth: image.naturalWidth,
      naturalHeight: image.naturalHeight,
      renderedWidth: Math.round(image.getBoundingClientRect().width),
      renderedHeight: Math.round(image.getBoundingClientRect().height),
    };
  });
}

test("Genshin remote avatars use Next Image and return 200 without image errors", async ({
  page,
  request,
}) => {
  test.setTimeout(120000);
  const imageErrors: string[] = [];
  page.on("console", (message) => {
    if (
      message.type() === "error" &&
      /(image|img|_next\/image|media\.tierlistbase\.com)/i.test(message.text())
    ) {
      imageErrors.push(message.text());
    }
  });

  await page.setViewportSize({ width: 1440, height: 900 });
  const response = await page.goto("/genshin-impact/tier-list", { waitUntil: "networkidle" });
  expect(response?.status()).toBe(200);
  await page.getByRole("searchbox", { name: "Search characters" }).fill("Nahida");
  const nahida = page.getByRole("button", { name: /Nahida, Dendro/ });
  await expect(nahida).toBeVisible();

  const board = await sample(nahida.locator('[data-avatar="board"] img'));
  expect(new URL(board.currentSrc).pathname).toBe("/_next/image");
  expect(board.source).toContain("https://media.tierlistbase.com/");
  const boardResponse = await request.get(board.currentSrc);
  expect(boardResponse.status()).toBe(200);

  await nahida.click();
  const detail = await sample(
    page
      .locator('[data-ia-section="character-detail"] [data-avatar="detail"] img')
      .filter({ visible: true })
      .first(),
  );
  expect(new URL(detail.currentSrc).pathname).toBe("/_next/image");
  expect(detail.source).toContain("https://media.tierlistbase.com/");
  const detailResponse = await request.get(detail.currentSrc);
  expect(detailResponse.status()).toBe(200);

  expect(imageErrors).toEqual([]);
  const broken = await page.locator("main img").evaluateAll(
    (images) =>
      images.filter((image) => {
        const img = image as HTMLImageElement;
        return img.complete && img.naturalWidth === 0;
      }).length,
  );
  expect(broken).toBe(0);

  console.log(
    `P2P3_GENSHIN_REMOTE_OK ${JSON.stringify({
      board,
      boardStatus: boardResponse.status(),
      detail,
      detailStatus: detailResponse.status(),
      broken,
      imageErrors,
    })}`,
  );
});

for (const width of [390, 1440]) {
  test(`Wild Rift small card and detail portraits use Next Image at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(120000);
    await page.setViewportSize({ width, height: 900 });
    const response = await page.goto("/wild-rift/tier-list", { waitUntil: "networkidle" });
    expect(response?.status()).toBe(200);

    const small = await sample(
      page.locator('[data-ia-section="all-roles-overview"] img').first(),
    );

    const roleNav = page.getByRole("tablist", { name: "Wild Rift role rankings" });
    await roleNav.getByRole("tab", { name: /^Jungle$/ }).click();
    const cardButton = page.locator('[data-champion-id="nocturne"]');
    await expect(cardButton).toBeVisible();
    const card = await sample(cardButton.locator("img"));
    await cardButton.click();

    const detailRoot =
      width <= 700
        ? page.getByRole("dialog").filter({ visible: true }).first()
        : page
            .getByRole("complementary", { name: "Champion Detail" })
            .filter({ visible: true })
            .first();
    const detail = await sample(detailRoot.locator("img").first());

    for (const portrait of [small, card, detail]) {
      expect(new URL(portrait.currentSrc).pathname).toBe("/_next/image");
      expect(portrait.source).toContain("/images/wild-rift/champions/");
      expect(portrait.source).toContain(".png");
      expect(portrait.candidateWidth).toBeGreaterThan(0);
    }

    const directChampionPng = await page.evaluate(() =>
      (performance.getEntriesByType("resource") as PerformanceResourceTiming[]).filter((entry) => {
        const url = new URL(entry.name);
        return (
          url.pathname.startsWith("/images/wild-rift/champions/") &&
          url.pathname.endsWith(".png")
        );
      }).length,
    );
    expect(directChampionPng).toBe(0);

    console.log(
      `P2P3_WILD_PORTRAITS_OK ${JSON.stringify({
        width,
        small,
        card,
        detail,
        directChampionPng,
      })}`,
    );
  });
}
