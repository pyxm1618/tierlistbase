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
    await page.waitForTimeout(1000);
    await page.keyboard.up("Space");
    await expect(page.getByRole("region", { name: "Vanguard Reveal" })).toBeVisible({
      timeout: 15000,
    });
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
    expect(sounds).not.toContain("vanguard-ambient-theme.wav");
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
      data: { seatId, reason: "privacy" },
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
    await page.getByRole("textbox", { name: "Seat ID", exact: true }).fill(seatId);
    await page.getByRole("button", { name: "Focus Seat", exact: true }).click();
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
