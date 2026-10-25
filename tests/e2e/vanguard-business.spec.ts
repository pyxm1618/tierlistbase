import sharp from "sharp";
import jsQR from "jsqr";
import { readFile } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { expect, test } from "@playwright/test";
import { makeSignature } from "better-auth/crypto";
import { eq, sql } from "drizzle-orm";
import { createDatabaseClient } from "@/platform/database/client";
import { user, session, accountSubjects } from "@/platform/database/schema";
import { readLatestTestEmail } from "@/platform/email/file-test-email-sender";
import { assertSafeTestDatabaseUrl } from "../support/test-database-guard";
test.skip(process.env.CREAT_WEB_E2E_VANGUARD !== "1", "Requires isolated Vanguard test runtime");
test("real API default-emblem Claim → DB → Reveal → Search → Report email, with independent SFX", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const database = createDatabaseClient(assertSafeTestDatabaseUrl());
  const owner = randomUUID();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  const [before] = await database.db.execute<{
    wow_claimed_count: number;
    wow_completed_at: Date | null;
  }>(sql`select wow_claimed_count,wow_completed_at from vanguard_event_state where id=1`);
  const originalCount = before?.wow_claimed_count ?? 0;
  await database.db
    .insert(user)
    .values({ id: owner, name: "Private OAuth identity", email: `${owner}@example.test` });
  await database.db.insert(session).values({
    id: randomUUID(),
    userId: owner,
    token,
    expiresAt: new Date(now.getTime() + 3600000),
    createdAt: now,
    updatedAt: now,
  });
  const signature = await makeSignature(token, process.env.VANGUARD_E2E_AUTH_TOKEN!);
  await context.addCookies([
    {
      name: "tierlistbase.session_token",
      value: `${token}.${signature}`,
      url: "http://127.0.0.1:3197",
    },
  ]);
  const seatId = "WOW-W1-2000";
  const sounds: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".wav")) sounds.push(request.url().split("/").at(-1)!);
  });
  try {
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await page.getByLabel("Vanguard Name", { exact: true }).fill("Real API Vanguard");
    await page.getByLabel("Faction", { exact: true }).selectOption("alliance");
    await page.getByLabel("Class", { exact: true }).selectOption("Warrior");
    const button = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await expect(button).toBeEnabled();
    await button.focus();
    await page.keyboard.down("Space");
    await page.waitForTimeout(4150);
    await page.keyboard.up("Space");
    await expect(page.getByRole("region", { name: "Vanguard Reveal" })).toBeVisible({
      timeout: 15000,
    });
    await page.screenshot({ path: "/tmp/vanguard-final-reveal.png", fullPage: true });
    const enter = page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true });
    if (await enter.isVisible()) await enter.click();
    const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
      exact: true,
    });
    await expect(canvas).toBeVisible();
    await expect
      .poll(() => canvas.evaluate((node) => (node as HTMLCanvasElement).width))
      .toBeGreaterThan(1);
    await canvas.screenshot({ path: "/tmp/vanguard-final-scene.png" });
    await page.getByRole("button", { name: "Continue exploring", exact: true }).click();
    await canvas.screenshot({ path: "/tmp/vanguard-final-monument.png" });
    await page.getByRole("button", { name: "VIEW MY SEAT", exact: true }).click();
    // Reveal exports remain available via My Vanguard after browsing.
    await page.goto("/account/vanguard");
    for (const format of ["9:16", "1:1"] as const) {
      const downloadPromise = page.waitForEvent("download");
      await page.getByRole("button", { name: `Save ${format}`, exact: true }).click();
      const download = await downloadPromise;
      const exportPath = `/tmp/vanguard-final-seal-${format.replace(":", "x")}.png`;
      await download.saveAs(exportPath);
      const bytes = await readFile(exportPath);
      const { info } = await sharp(bytes).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      expect([info.width, info.height]).toEqual(format === "9:16" ? [1080, 1920] : [1254, 1254]);
      const qrRegion =
        format === "9:16"
          ? { left: 820, top: 1660, width: 145, height: 145 }
          : { left: 1040, top: 962, width: 150, height: 150 };
      const decoded = await sharp(bytes)
        .extract(qrRegion)
        .ensureAlpha()
        .raw()
        .toBuffer({ resolveWithObject: true });
      const code = jsQR(
        new Uint8ClampedArray(decoded.data),
        decoded.info.width,
        decoded.info.height,
      );
      expect(code?.data).toBe(`http://127.0.0.1:3197/wow-forever/vanguard?seat=${seatId}`);
    }
    const [inscription] = await database.db.execute<{ seat_id: string; media_id: string | null }>(
      sql`select seat_id,media_id from vanguard_inscriptions where user_id=${owner}`,
    );
    expect(inscription?.seat_id).toBe(seatId);
    expect(inscription?.media_id).toBeNull();
    for (const sound of [
      "vanguard-plaque-form.wav",
      "vanguard-plaque-lock.wav",
      "vanguard-monument-ignite.wav",
    ])
      expect(sounds).toContain(sound);
    expect(sounds).toContain("vanguard-ambient-theme.wav");
    const duplicate = await page.request.post("/api/vanguard/holds", {
      headers: { Origin: "http://127.0.0.1:3197" },
      data: { seatId: "WOW-W1-2001" },
    });
    expect(duplicate.status()).toBe(409);
    expect((await duplicate.json()).error.code).toBe("ACCOUNT_ALREADY_INSCRIBED");
    const search = await page.request.get("/api/vanguard/search?q=Real%20API");
    expect(search.status()).toBe(200);
    const results = await search.json();
    expect(results.results.some((row: { seatId: string }) => row.seatId === seatId)).toBe(true);
    expect(JSON.stringify(results)).not.toMatch(/Private OAuth|@example|userId/);
    const report = await page.request.post("/api/vanguard/reports", {
      headers: { Origin: "http://127.0.0.1:3197" },
      data: { operationId: crypto.randomUUID(), seatId, reason: "privacy" },
    });
    expect(report.status()).toBe(201);
    expect(report.headers()["cache-control"]).toBe("no-store");
    const email = await readLatestTestEmail(
      "/tmp/tierlistbase-vanguard-e2e-emails",
      "support@localhost.invalid",
    );
    expect(email?.template).toBe("vanguard-report");
    expect(email?.html).toContain(seatId);
    expect(email?.html).toContain("privacy");
    expect(email?.html).toContain(`/wow-forever/vanguard?seat=${seatId}`);
    expect(
      (
        await database.db.execute<{ status: string }>(
          sql`select status from vanguard_inscriptions where user_id=${owner}`,
        )
      )[0]?.status,
    ).toBe("active");
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await expect(page.getByRole("region", { name: "Vanguard Focus" })).toBeVisible();
    await page.getByRole("button", { name: "Close Focus" }).click();
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await page.getByLabel("Vanguard name or guild").fill("Real API Vanguard");
    await page.getByRole("button", { name: "Search", exact: true }).last().click();
    await page.getByRole("button", { name: /Real API Vanguard/ }).click();
    await expect.poll(() => sounds.includes("vanguard-focus-open.wav")).toBe(true);
  } finally {
    // Only this test's records are removed. Counter reconciliation fails closed if another writer intervened.
    await database.db.transaction(async (transaction) => {
      const [state] = await transaction.execute<{ wow_claimed_count: number }>(
        sql`select wow_claimed_count from vanguard_event_state where id=1 for update`,
      );
      const owned = await transaction.execute<{ id: string }>(
        sql`select id from vanguard_inscriptions where user_id=${owner}`,
      );
      if ((state?.wow_claimed_count ?? 0) !== originalCount + owned.length)
        throw new Error("Fixture counter reconciliation failed; preserving records");
      await transaction.execute(
        sql`delete from vanguard_reports where inscription_id in (select id from vanguard_inscriptions where user_id=${owner})`,
      );
      await transaction.execute(sql`delete from vanguard_inscriptions where user_id=${owner}`);
      if (owned.length)
        await transaction.execute(
          sql`update vanguard_event_state set wow_claimed_count=${originalCount},wow_completed_at=${before?.wow_completed_at ?? null} where id=1`,
        );
      await transaction.execute(sql`delete from vanguard_seat_holds where user_id=${owner}`);
    });
    await database.db.delete(session).where(eq(session.userId, owner));
    await database.db.delete(accountSubjects).where(eq(accountSubjects.authUserId, owner));
    await database.db.delete(user).where(eq(user.id, owner));
    await database.close();
  }
});
test("real API rejects invalid input/origin, requires auth and uses Google-only callback", async ({
  request,
}) => {
  const forbidden = await request.post("/api/vanguard/holds", {
    headers: { Origin: "https://other.example" },
    data: { seatId: "WOW-W1-0001" },
  });
  expect(forbidden.status()).toBe(400);
  const unauth = await request.post("/api/vanguard/media/presign", {
    headers: { Origin: "http://127.0.0.1:3197" },
    data: {},
  });
  expect(unauth.status()).toBe(401);
  const invalid = await request.post("/api/vanguard/reports", {
    headers: { Origin: "http://127.0.0.1:3197" },
    data: { seatId: "WOW-W1-0001", reason: "free text" },
  });
  expect(invalid.status()).toBe(400);
  const oauth = await request.post("/api/auth/sign-in/social", {
    headers: { Origin: "http://127.0.0.1:3197" },
    data: { provider: "google", callbackURL: "/wow-forever/vanguard?seat=WOW-W1-2000" },
  });
  expect(oauth.status()).toBe(200);
  const payload = await oauth.json();
  const destination = new URL(payload.url);
  expect(destination.hostname).toBe("accounts.google.com");
  expect(destination.searchParams.get("redirect_uri")).toBe(
    "http://127.0.0.1:3197/api/auth/callback/google",
  );
});

for (const width of [390, 1440]) {
  test(`shared Header uses server session and signs out at ${width}px`, async ({
    page,
    context,
  }) => {
    const database = createDatabaseClient(assertSafeTestDatabaseUrl());
    const owner = randomUUID();
    const token = randomBytes(32).toString("base64url");
    const now = new Date();
    await page.setViewportSize({ width, height: 900 });
    const menu = async () => {
      if (width < 1024) await page.locator("header summary").filter({ hasText: "Menu" }).click();
    };
    try {
      await page.goto("/");
      await menu();
      await expect(
        page
          .locator("header")
          .getByRole("link", { name: "Sign in", exact: true })
          .filter({ visible: true }),
      ).toHaveAttribute("href", "/sign-in");
      await expect(page.locator("header").getByText("Account", { exact: true })).toHaveCount(0);
      for (const path of ["/account", "/account/vanguard", "/account/security"]) {
        await page.goto(path);
        await expect(page).toHaveURL(/\/sign-in/);
      }
      await database.db
        .insert(user)
        .values({ id: owner, name: "Header private identity", email: `${owner}@example.test` });
      await database.db.insert(session).values({
        id: randomUUID(),
        userId: owner,
        token,
        expiresAt: new Date(now.getTime() + 3600000),
        createdAt: now,
        updatedAt: now,
      });
      const signature = await makeSignature(token, process.env.VANGUARD_E2E_AUTH_TOKEN!);
      await context.addCookies([
        {
          name: "tierlistbase.session_token",
          value: `${token}.${signature}`,
          url: "http://127.0.0.1:3197",
        },
      ]);
      const response = await page.goto("/");
      const html = await response!.text();
      const serverHeader = html.match(/<header\b[\s\S]*?<\/header>/)?.[0];
      expect(serverHeader).toContain("Account");
      expect(serverHeader).not.toContain(">Sign in<");
      expect(
        await database.db
          .select()
          .from(accountSubjects)
          .where(eq(accountSubjects.authUserId, owner)),
      ).toHaveLength(0);
      await menu();
      if (width >= 1024)
        await page
          .locator("header")
          .getByRole("button", { name: "Header private identity", exact: true })
          .click();
      await expect(
        page.locator("header").getByRole("link", { name: "Sign in", exact: true }),
      ).toHaveCount(0);
      for (const [name, href] of [
        ["My Account", "/account"],
        ["My Vanguard", "/account/vanguard"],
        ["Security", "/account/security"],
      ] as const) {
        await expect(
          page
            .locator("header")
            .getByRole("menuitem", { name, exact: true })
            .filter({ visible: true }),
        ).toHaveAttribute("href", href);
      }
      await page.goto("/limbus-company/tier-list");
      await page
        .locator("header")
        .getByRole("button", { name: "Header private identity", exact: true })
        .click();
      await expect(
        page
          .locator("header")
          .getByRole("menuitem", { name: "My Vanguard", exact: true })
          .filter({ visible: true }),
      ).toBeVisible();
      for (const path of ["/account", "/account/vanguard", "/account/security"]) {
        await page.goto(path);
        await expect(page).toHaveURL(new RegExp(`${path}$`));
      }
      await page.goto("/");
      await menu();
      if (width >= 1024)
        await page
          .locator("header")
          .getByRole("button", { name: "Header private identity", exact: true })
          .click();
      await page
        .locator("header")
        .getByRole("menuitem", { name: "Sign out", exact: true })
        .filter({ visible: true })
        .click();
      await page.waitForLoadState("load");
      await expect
        .poll(
          async () =>
            (await database.db.select().from(session).where(eq(session.token, token))).length,
        )
        .toBe(0);
      await expect(page.locator("header").getByText("Account", { exact: true })).toHaveCount(0);
      await menu();
      await expect(
        page
          .locator("header")
          .getByRole("link", { name: "Sign in", exact: true })
          .filter({ visible: true }),
      ).toBeVisible();
      for (const path of ["/account", "/account/vanguard", "/account/security"]) {
        await page.goto(path);
        await expect(page).toHaveURL(/\/sign-in/);
      }
      await page.goto("/wow-forever/vanguard");
      await expect(page.getByRole("button", { name: "ENTER THE MONUMENT" })).toBeVisible();
    } finally {
      await database.db.delete(session).where(eq(session.userId, owner));
      await database.db.delete(accountSubjects).where(eq(accountSubjects.authUserId, owner));
      await database.db.delete(user).where(eq(user.id, owner));
      await database.close();
    }
  });
}
