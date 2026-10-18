import { expect, test } from "@playwright/test";

const route = "/nikke/tier-list";

test(
  "NIKKE preview preserves the frozen architecture and local interactions",
  async ({ page }) => {
    const fetches: string[] = [];
    page.on("request", (request) => {
      if (request.resourceType() === "fetch") fetches.push(request.url());
    });

    await page.goto(route);
    await expect(page.getByRole("heading", { level: 1, name: "NIKKE" })).toBeVisible();

    await expect(page.locator("#quick-picks article")).toHaveCount(5);
    for (const name of [
      "CAMPAIGN / TOWER TIER LIST",
      "BOSS / RAID TIER LIST",
      "PVP / ARENA TIER LIST",
    ]) {
      await expect(
        page.getByRole("button", { name: new RegExp(name.replaceAll("/", "\\/"), "i") }),
      ).toHaveCount(1);
    }

    for (const group of [
      "Burst Type",
      "Element",
      "Weapon",
      "Class",
      "Manufacturer",
      "Rarity",
      "Availability",
      "Role / Mechanic",
      "Favorite Item / Treasure",
    ]) {
      await expect(page.getByRole("group", { name: group, exact: true })).toBeVisible();
    }

    const characterList = page.locator('section[aria-label="Character List"]');
    await expect(characterList.getByRole("button")).toHaveCount(18);
    await page.getByRole("searchbox", { name: "Search characters" }).fill("Liter");
    await expect(characterList.getByRole("button")).toHaveCount(1);
    await page.getByRole("button", { name: "Reset All" }).click();
    await expect(characterList.getByRole("button")).toHaveCount(18);

    const bossMode = page.getByRole("button", { name: /BOSS \/ RAID TIER LIST/i });
    await bossMode.click();
    await expect(bossMode).toHaveAttribute("aria-pressed", "true");

    const teams = page.locator("#teams");
    const bossTeam = teams.getByRole("button", { name: "Boss / Raid Team", exact: true });
    await bossTeam.click();
    await expect(bossTeam).toHaveAttribute("aria-pressed", "true");
    await expect(
      teams.getByRole("heading", { name: "Boss / Raid Team", exact: true }),
    ).toBeVisible();

    const wishlist = page.locator("#wishlist");
    const raidWishlist = wishlist.getByRole("button", { name: "Raid", exact: true });
    await raidWishlist.click();
    await expect(raidWishlist).toHaveAttribute("aria-pressed", "true");

    const methodology = page.locator("#methodology");
    const pvpMethodology = methodology.getByRole("button", { name: "PvP", exact: true });
    await pvpMethodology.click();
    await expect(pvpMethodology).toHaveAttribute("aria-pressed", "true");
    await expect(methodology).toContainText("Burst generation speed");

    expect(fetches).toEqual([]);
  },
);

for (const width of [390, 1440]) {
  test(`NIKKE preview has no horizontal overflow at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await page.evaluate(async () => {
      await document.fonts.ready;
    });
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(
      true,
    );
    await expect(page.getByRole("heading", { level: 1, name: "NIKKE" })).toBeVisible();
  });
}
