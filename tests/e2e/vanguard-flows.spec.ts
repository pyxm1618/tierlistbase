import { randomBytes, randomUUID } from "node:crypto";
import { expect, test, type Page, type BrowserContext } from "@playwright/test";
import { makeSignature } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { createDatabaseClient } from "@/platform/database/client";
import { user, session, accountSubjects } from "@/platform/database/schema";
import { assertSafeTestDatabaseUrl } from "../support/test-database-guard";
// UI contract fixtures. Real DB transaction/provider evidence is covered separately; these are not live service acceptance.
test.skip(
  process.env.CREAT_WEB_E2E_VANGUARD !== "1",
  "Run with playwright.vanguard.config.ts and the Google-only test profile",
);
const seatId = "WOW-W1-0002";
const publicSeat = {
  seatId,
  status: "active",
  displayName: "Chosen Vanguard",
  faction: "horde",
  className: "Mage",
  guildName: "Test Guild",
  battleCry: "For Azeroth",
  inscribedAt: "2026-10-20T00:00:00.000Z",
  image: null,
};
async function account(context: BrowserContext) {
  const database = createDatabaseClient(assertSafeTestDatabaseUrl());
  const id = randomUUID();
  const token = randomBytes(32).toString("base64url");
  const now = new Date();
  await database.db
    .insert(user)
    .values({ id, name: "Private Google identity", email: `${id}@example.test` });
  await database.db.insert(session).values({
    id: randomUUID(),
    token,
    userId: id,
    expiresAt: new Date(now.getTime() + 86400000),
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
  return async () => {
    await database.db.delete(session).where(eq(session.userId, id));
    await database.db.delete(accountSubjects).where(eq(accountSubjects.authUserId, id));
    await database.db.delete(user).where(eq(user.id, id));
    await database.close();
  };
}
async function fixtures(
  page: Page,
  options: {
    media?: "approved" | "rejected" | "unavailable";
    stolen?: boolean;
    sealed?: boolean;
    existing?: boolean;
    longText?: boolean;
    manifestGate?: Promise<void>;
    stage?: "COMPLETE" | "WOW_COMPLETE_WAITING" | "FOREVER_OPEN";
  } = {},
) {
  let accepted = Boolean(options.existing);
  let holdCalls = 0;
  const uploadId = randomUUID();
  await page.route("**/api/vanguard/**", async (route) => {
    const request = route.request();
    const url = new URL(request.url());
    const path = url.pathname.replace("/api/vanguard/", "");
    if (path === "me")
      return route.fulfill({ json: { inscription: accepted ? publicSeat : null } });
    if (path === "manifest") {
      await options.manifestGate;
      return route.fulfill({
        json: {
          stage: options.sealed ? "SEALED" : (options.stage ?? "WOW_OPEN"),
          counts: options.stage
            ? {
                wow: 8016,
                forever: options.stage === "COMPLETE" ? 56112 : 0,
                total: options.stage === "COMPLETE" ? 64128 : 8016,
              }
            : { wow: accepted ? 1 : 0, forever: 0, total: accepted ? 1 : 0 },
          wowCompletedAt: options.stage ? "2026-10-19T12:00:00.000Z" : null,
          foreverUnlockAt: options.stage ? "2026-10-20T12:00:00.000Z" : null,
          eventCloseAt: "2026-11-04T23:00:00Z",
          phase: options.stage === "FOREVER_OPEN" ? "forever" : "wow",
          occupancy: Buffer.alloc(options.stage === "FOREVER_OPEN" ? 7014 : 1002).toString(
            "base64",
          ),
          version: "a".repeat(64),
        },
      });
    }
    if (path === "holds") {
      holdCalls++;
      if (options.stolen && holdCalls === 1)
        return route.fulfill({
          status: 409,
          json: { error: { code: "SEAT_ALREADY_CLAIMED", nearestSeatId: "WOW-W1-0003" } },
        });
      return route.fulfill({
        json: {
          seatId: request.postDataJSON().seatId,
          holdToken: "h".repeat(43),
          expiresAt: new Date(Date.now() + 180000).toISOString(),
        },
      });
    }
    if (path.startsWith("inscriptions/")) {
      return (accepted || options.stolen) && path.endsWith(seatId)
        ? route.fulfill({ json: publicSeat })
        : route.fulfill({ status: 404, json: { error: { code: "SEAT_NOT_FOUND" } } });
    }
    if (path === "inscriptions") {
      const draft = request.postDataJSON();
      expect(draft.displayName).toBe(options.longText ? "先锋".repeat(16) : "Chosen Vanguard");
      expect(draft).not.toHaveProperty("email");
      accepted = true;
      return route.fulfill({
        status: 201,
        json: {
          ...publicSeat,
          displayName: draft.displayName,
          guildName: draft.guildName || null,
          battleCry: draft.battleCry || null,
          ...(draft.mediaId
            ? {
                image: {
                  detail: `https://media.tierlistbase.com/vanguard/permanent/${uploadId}/detail.webp`,
                  wow: `https://media.tierlistbase.com/vanguard/permanent/${uploadId}/wow-256.webp`,
                  forever: `https://media.tierlistbase.com/vanguard/permanent/${uploadId}/forever-128.webp`,
                },
              }
            : {}),
        },
      });
    }
    if (path === "media/presign")
      return route.fulfill({
        status: 201,
        json: {
          mediaId: uploadId,
          uploadUrl: "http://127.0.0.1:3197/vanguard-test-upload",
          contentType: "image/webp",
        },
      });
    if (path === "media/complete") {
      if (options.media === "rejected")
        return route.fulfill({
          status: 422,
          json: { error: { code: "MEDIA_MODERATION_REJECTED" } },
        });
      if (options.media === "unavailable")
        return route.fulfill({ status: 503, json: { error: { code: "MODERATION_UNAVAILABLE" } } });
      return route.fulfill({ json: { mediaId: uploadId, status: "approved" } });
    }
    if (path === "reports") {
      expect([
        "sexual_graphic",
        "hate_impersonation",
        "privacy",
        "spam_promotion",
        "other",
      ]).toContain(request.postDataJSON().reason);
      return route.fulfill({ status: 201, json: { received: true } });
    }
    if (path.startsWith("search"))
      return route.fulfill({ json: { results: accepted ? [publicSeat] : [] } });
    return route.fulfill({ status: 503, json: { error: { code: "SERVICE_UNAVAILABLE" } } });
  });
  await page.route("**/vanguard-test-upload", async (route) => {
    const bytes = route.request().postDataBuffer()!;
    const metadata = await sharp(bytes).metadata();
    expect(metadata.width).toBe(metadata.height);
    expect(metadata.width).toBeLessThanOrEqual(2048);
    expect(metadata.exif).toBeUndefined();
    expect(bytes.length).toBeLessThanOrEqual(4 * 1024 * 1024);
    await route.fulfill({ status: 200, body: "" });
  });
}
async function openSearch(page: Page) {
  const close = page.getByRole("button", { name: "Close Focus", exact: true });
  if (await close.isVisible()) await close.click();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByLabel("Search Seat ID, Vanguard Name or Guild")).toBeVisible();
}
async function openClaim(page: Page) {
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  await expect(page.getByRole("heading", { name: `Claim ${seatId}`, exact: true })).toBeVisible();
  await page.getByLabel("Vanguard Name", { exact: true }).fill("Chosen Vanguard");
  await page.getByLabel("Faction", { exact: true }).selectOption("horde");
  await page.getByLabel("Class", { exact: true }).selectOption("Mage");
}
async function inscribe(page: Page) {
  const button = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
  await expect(button).toBeEnabled();
  await button.focus();
  await page.keyboard.down("Space");
  await page.waitForTimeout(4150);
  await page.keyboard.up("Space");
  await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toBeVisible({
    timeout: 15000,
  });
}
for (const width of [390, 768, 1024, 1440, 1920])
  test(`Google-only session, default emblem, inscription and reveal at ${width}px`, async ({
    page,
    context,
  }) => {
    const cleanup = await account(context);
    try {
      await page.setViewportSize({ width, height: 900 });
      await fixtures(page, { longText: width === 1920 });
      await openClaim(page);
      if (width === 1920) {
        await page.getByLabel("Vanguard Name", { exact: true }).fill("先锋".repeat(16));
        await page.getByLabel("Guild (optional)").fill("公会".repeat(24));
        await page.getByLabel("Battle Cry (optional)").fill("勇士".repeat(60));
      }
      await expect(page.getByLabel("Vanguard Name", { exact: true })).not.toHaveValue(
        "Private Google identity",
      );
      await inscribe(page);
      await expect(
        page.getByRole("button", { name: "STAND BESIDE ME", exact: true }),
      ).toBeVisible();
      await expect(
        page.getByRole("link", { name: "See how Mage is performing in WoW Forever" }),
      ).toHaveAttribute("href", "/wow-forever/tier-list?class=Mage");
      await expect(page.getByRole("button", { name: "Save 9:16", exact: true })).toBeEnabled();
      await expect(page.getByRole("button", { name: "Save 1:1", exact: true })).toBeEnabled();
      if (width === 1920) {
        for (const format of ["9:16", "1:1"]) {
          const pendingDownload = page.waitForEvent("download");
          await page.getByRole("button", { name: `Save ${format}`, exact: true }).click();
          await (
            await pendingDownload
          ).saveAs(`/tmp/vanguard-long-seal-${format.replace(":", "x")}.png`);
        }
      }
    } finally {
      await cleanup();
    }
  });
test("OAuth return preserves draft and recommends a nearby seat after conflict", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  try {
    await fixtures(page, { stolen: true });
    await page.addInitScript(() =>
      sessionStorage.setItem(
        "tierlistbase:vanguard:draft",
        JSON.stringify({
          seatId: "WOW-W1-0002",
          holdToken: "h".repeat(43),
          displayName: "Chosen Vanguard",
          faction: "horde",
          className: "Mage",
          guildName: "Test Guild",
          battleCry: "For Azeroth",
        }),
      ),
    );
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await expect(page.getByText("This place was just claimed.", { exact: false })).toBeVisible();
    await expect(page.getByLabel("Guild (optional)")).toHaveValue("Test Guild");
    await page.getByRole("button", { name: "Choose nearby seat WOW-W1-0003" }).click();
    await expect(page.getByLabel("Vanguard Name", { exact: true })).toHaveValue("Chosen Vanguard");
  } finally {
    await cleanup();
  }
});
for (const decision of ["approved", "rejected", "unavailable"] as const)
  test(`square crop and upload ${decision}`, async ({ page, context }) => {
    const cleanup = await account(context);
    try {
      await fixtures(page, { media: decision });
      await openClaim(page);
      const image = await sharp({
        create: { width: 1024, height: 768, channels: 3, background: "blue" },
      })
        .png()
        .toBuffer();
      await page
        .getByLabel("Choose Memory Image")
        .setInputFiles({ name: "synthetic.png", mimeType: "image/png", buffer: image });
      if (decision === "approved") {
        await page.getByRole("slider", { name: "Zoom", exact: true }).focus();
        await page.keyboard.press("Home");
        const cropPreview = page.getByLabel("Square crop preview", { exact: true });
        await cropPreview.focus();
        await page.keyboard.press("ArrowRight");
        const horizontal = page.getByLabel("Horizontal position", { exact: true });
        await expect.poll(async () => Number(await horizontal.inputValue())).toBeGreaterThan(0);
        const before = Number(await horizontal.inputValue());
        const rect = await cropPreview.boundingBox();
        if (!rect) throw new Error("Crop preview missing");
        await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
        await page.mouse.down();
        await page.mouse.move(rect.x + rect.width / 2 - 20, rect.y + rect.height / 2);
        await page.mouse.up();
        await expect
          .poll(async () => Number(await horizontal.inputValue()))
          .toBeGreaterThan(before);
      }
      await page.getByRole("button", { name: "Upload square crop" }).click();
      if (decision === "approved") await expect(page.getByText("Image approved")).toBeVisible();
      else {
        await expect(
          page.getByText(
            decision === "rejected"
              ? "This image can’t be used."
              : "We couldn’t verify this image right now.",
            { exact: false },
          ),
        ).toBeVisible();
        await page.getByRole("button", { name: "Use Class Default Emblem" }).click();
      }
      await inscribe(page);
    } finally {
      await cleanup();
    }
  });
test("sealed polling leaves Focus, share and Tier List available and blocks empty seats", async ({
  page,
}) => {
  await fixtures(page, { sealed: true });
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect(page.getByText("THE MONUMENT IS SEALED", { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await openSearch(page);
  await page.getByLabel("Search Seat ID, Vanguard Name or Guild").fill(seatId);
  await page.getByRole("button", { name: "Focus Seat", exact: true }).click();
  await expect(
    page.getByText("The inscription period has ended. The Monument is now sealed.", {
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByRole("region", { name: "Claim your place", exact: true })).toHaveCount(0);
});
test("Google is the only sign-in action in the Vanguard profile", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(
    page.getByRole("button", { name: "Continue with Google", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: /password/i })).toHaveCount(0);
});
test("mouse long press commits and locks the inscription", async ({ page, context }) => {
  const cleanup = await account(context);
  try {
    await fixtures(page);
    await openClaim(page);
    const button = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await button.scrollIntoViewIfNeeded();
    await expect(button).toBeEnabled();
    const rect = await button.boundingBox();
    if (!rect) throw new Error("Hold control missing");
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    await page.mouse.down();
    await page.waitForTimeout(4150);
    await page.mouse.up();
    await expect(page.getByRole("region", { name: "Vanguard Reveal" })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByRole("region", { name: "Claim your place" })).toHaveCount(0);
  } finally {
    await cleanup();
  }
});
test("camera permission is requested only by Enable, with rejection fallback", async ({ page }) => {
  let requests = 0;
  await page.exposeFunction("vanguardCameraAttempt", () => {
    requests++;
  });
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      await (
        window as unknown as { vanguardCameraAttempt: () => Promise<void> }
      ).vanguardCameraAttempt();
      throw new DOMException("Denied", "NotAllowedError");
    };
  });
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  expect(requests).toBe(0);
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect(page.getByRole("button", { name: "Enable Gesture Control" })).toBeEnabled();
  expect(requests).toBe(0);
  await page.getByRole("button", { name: "Enable Gesture Control" }).click();
  await expect(page.getByText("Gesture control is unavailable.", { exact: false })).toBeVisible();
  expect(requests).toBe(1);
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeEnabled();
});
test("touch and reduced motion preserve the full default-emblem flow", async ({ browser }) => {
  const context = await browser.newContext({
    hasTouch: true,
    isMobile: true,
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const cleanup = await account(context);
  const page = await context.newPage();
  try {
    await fixtures(page);
    await openClaim(page);
    const button = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await button.scrollIntoViewIfNeeded();
    const rect = await button.boundingBox();
    if (!rect) throw new Error("Hold control missing");
    const cdp = await context.newCDPSession(page);
    await cdp.send("Input.dispatchTouchEvent", {
      type: "touchStart",
      touchPoints: [{ x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }],
    });
    await page.waitForTimeout(4150);
    await cdp.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
    await expect(page.getByRole("region", { name: "Vanguard Reveal" })).toBeVisible({
      timeout: 15000,
    });
  } finally {
    await cleanup();
    await context.close();
  }
});
test("explicit camera activation loads self-hosted detection and stops tracks", async ({
  page,
}) => {
  await fixtures(page);
  const runtime: string[] = [];
  page.on("request", (request) => {
    if (/hand_landmarker|vision_wasm/.test(request.url())) runtime.push(request.url());
  });
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await page.getByRole("button", { name: "Enable Gesture Control" }).click();
  await expect(page.getByRole("button", { name: "Disable Gesture Control" })).toBeVisible({
    timeout: 25000,
  });
  expect(runtime.length).toBeGreaterThan(1);
  expect(runtime.every((url) => new URL(url).origin === "http://127.0.0.1:3197")).toBe(true);
  await page.getByRole("button", { name: "Disable Gesture Control" }).click();
  expect(
    await page.locator("video").evaluate((video) => (video as HTMLVideoElement).srcObject === null),
  ).toBe(true);
});
test("sealed archive keeps public Focus, report, share and Tier List", async ({ page }) => {
  await fixtures(page, { sealed: true, existing: true });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  const focus = page.getByRole("region", { name: "Vanguard Focus", exact: true });
  await expect(focus).toBeVisible();
  await expect(focus.getByText("Chosen Vanguard", { exact: true })).toBeVisible();
  await expect(focus.getByRole("button", { name: "STAND BESIDE ME" })).toBeEnabled();
  await expect(focus.getByRole("link", { name: "View Mage Tier List" })).toHaveAttribute(
    "href",
    "/wow-forever/tier-list?class=Mage",
  );
  await focus.getByText("Report", { exact: true }).click();
  await focus.getByRole("button", { name: "Submit Report" }).click();
  await expect(page.getByText("Report received. Thank you.", { exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Claim your place" })).toHaveCount(0);
});

for (const stage of ["COMPLETE", "WOW_COMPLETE_WAITING"] as const)
  test(`${stage} preserves browsing and blocks a new Claim`, async ({ page }) => {
    await fixtures(page, { stage });
    await page.goto("/wow-forever/vanguard");
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    await expect(
      page.getByText(stage === "COMPLETE" ? "THE MONUMENT IS COMPLETE" : "WOW IS COMPLETE", {
        exact: true,
      }),
    ).toBeVisible({ timeout: 20000 });
    if (stage === "WOW_COMPLETE_WAITING")
      await expect(page.getByText("FOREVER AWAKENS IN", { exact: false })).toBeVisible();
    await openSearch(page);
    await page.getByLabel("Search Seat ID, Vanguard Name or Guild").fill(seatId);
    await page.getByRole("button", { name: "Focus Seat", exact: true }).click();
    await expect(page.getByRole("region", { name: "Claim your place" })).toHaveCount(0);
    await expect(
      page.getByRole("link", { name: "WoW Forever Tier List", exact: true }).first(),
    ).toBeVisible();
  });

test("Music Toggle fetches only supplied BGM after user action and leaves Focus SFX on", async ({
  page,
}) => {
  const sounds: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".wav")) sounds.push(request.url().split("/").at(-1)!);
  });
  await fixtures(page, { existing: true });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  await expect(page.getByRole("region", { name: "Vanguard Focus" })).toBeVisible();
  expect(sounds).toEqual([]);
  await page.getByRole("button", { name: "Close Focus" }).click();
  await page.getByRole("button", { name: "Music Off", exact: true }).click();
  await expect.poll(() => sounds.includes("vanguard-ambient-theme.wav")).toBe(true);
  await page.getByRole("button", { name: "Music On", exact: true }).click();
  await openSearch(page);
  await page.getByLabel("Search Seat ID, Vanguard Name or Guild").fill(seatId);
  await page.getByRole("button", { name: "Focus Seat", exact: true }).click();
  await expect.poll(() => sounds.includes("vanguard-focus-open.wav")).toBe(true);
  await expect(page.getByRole("button", { name: "Music Off", exact: true })).toBeVisible();
});
test("BGM load failure is explicit and leaves ENTER usable", async ({ page }) => {
  await page.route("**/audio/vanguard-ambient-theme.wav", (route) =>
    route.fulfill({ status: 503, body: "fixture unavailable" }),
  );
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "Music Off", exact: true }).click();
  await expect(
    page.getByText("The background music could not load.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true })).toBeEnabled();
});
test("Focus image fallback does not leak into the next Seat", async ({ page, context }) => {
  const cleanup = await account(context);
  try {
    await fixtures(page, { existing: true });
    await page.route("https://media.tierlistbase.com/**", async (route) => {
      if (route.request().url().includes("00000000-0000-4000-8000-000000000001"))
        return route.fulfill({ status: 404, body: "missing" });
      return route.fulfill({
        contentType: "image/png",
        body: await readFile("public/wow-forever/vanguard/emblems/vanguard-class-mage.png"),
      });
    });
    await page.route("**/api/vanguard/inscriptions/*", (route) => {
      const first = route.request().url().endsWith(seatId);
      const mediaId = first
        ? "00000000-0000-4000-8000-000000000001"
        : "00000000-0000-4000-8000-000000000002";
      const base = `https://media.tierlistbase.com/vanguard/permanent/${mediaId}`;
      return route.fulfill({
        json: {
          ...publicSeat,
          seatId: first ? seatId : "WOW-W1-0003",
          image: {
            detail: `${base}/detail.webp`,
            wow: `${base}/wow-256.webp`,
            forever: `${base}/forever-128.webp`,
          },
        },
      });
    });
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    const focus = page.getByRole("region", { name: "Vanguard Focus", exact: true });
    await expect(focus.getByAltText("Mage Default Emblem")).toHaveCount(1);
    await expect(focus.getByAltText("Memory Image")).toHaveCount(0);
    await openSearch(page);
    await page.getByLabel("Search Seat ID, Vanguard Name or Guild").fill("WOW-W1-0003");
    await page.getByRole("button", { name: "Focus Seat", exact: true }).click();
    await expect(focus.getByAltText("Memory Image")).toHaveCount(1);
    await expect(focus.getByAltText("Mage Default Emblem")).toHaveCount(0);
    await expect
      .poll(() =>
        focus.getByAltText("Memory Image").evaluateAll((images) =>
          images.every((image) => {
            const element = image as HTMLImageElement;
            return element.complete && element.naturalWidth > 0;
          }),
        ),
      )
      .toBe(true);
  } finally {
    await cleanup();
  }
});

test("FOREVER uses all seven real final layouts and the supplied background", async ({ page }) => {
  test.setTimeout(60000);
  await fixtures(page, { stage: "FOREVER_OPEN" });
  const layouts = new Set<string>();
  page.on("request", (request) => {
    if (/\/layouts\/forever-[A-Z0-9]+\.f32$/.test(request.url())) layouts.add(request.url());
  });
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect.poll(() => layouts.size, { timeout: 25000 }).toBe(7);
  const canvas = page.getByLabel("Interactive Monument. Drag to pan, scroll or pinch to zoom.", {
    exact: true,
  });
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => canvas.evaluate((node) => (node as HTMLCanvasElement).width))
    .toBeGreaterThan(1);
  // A resized canvas can precede the first rendered frame during the phase switch.
  // Require actual nonblank artwork, rather than accepting only a canvas element.
  await expect
    .poll(
      async () => {
        const stats = await sharp(await canvas.screenshot()).stats();
        return stats.channels.slice(0, 3).every((channel) => channel.stdev > 20);
      },
      { timeout: 25000 },
    )
    .toBe(true);
  await canvas.screenshot({ path: "/tmp/vanguard-forever-final-scene.png" });
  await expect(page.getByText("MISSING_ASSET", { exact: false })).toHaveCount(0);
});

test("Capture Desktop visual release suite (1920x1080)", async ({ page, context }) => {
  test.setTimeout(120000);
  const screenshotDir = "test-results/vanguard-presentation";
  const cleanup = await account(context);
  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await fixtures(page);

    // 1. Desktop Hero
    await page.goto("/wow-forever/vanguard");
    await expect(
      page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }),
    ).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/desktop-01-hero.png` });

    // 2. Desktop Entered Monument
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    const canvas = page.getByLabel("Interactive Monument. Drag to pan, scroll or pinch to zoom.", {
      exact: true,
    });
    await expect(canvas).toBeVisible();
    await expect
      .poll(async () => {
        const stats = await sharp(
          await page
            .getByLabel("Interactive Monument. Drag to pan, scroll or pinch to zoom.", {
              exact: true,
            })
            .screenshot(),
        ).stats();
        return stats.channels.slice(0, 3).every((channel) => channel.stdev > 15);
      })
      .toBe(true);
    await page.screenshot({ path: `${screenshotDir}/desktop-02-entered-monument.png` });

    // 3. Desktop Search Overlay
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByLabel("Search Seat ID, Vanguard Name or Guild")).toBeVisible();
    await page.getByLabel("Search Seat ID, Vanguard Name or Guild").fill("Chosen Vanguard");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotDir}/desktop-03-search.png` });

    // 4. Desktop Focus Overlay
    await page.keyboard.press("Escape");
    await fixtures(page, { existing: true });
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible({
      timeout: 10000,
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotDir}/desktop-04-focus.png` });

    // 5. Desktop Claim Overlay
    await fixtures(page, { existing: false });
    await openClaim(page);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${screenshotDir}/desktop-05-claim.png` });

    // 6. Desktop Hold progress
    const holdBtn = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await expect(holdBtn).toBeEnabled({ timeout: 10000 });
    await holdBtn.focus();
    await page.keyboard.down("Space");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/desktop-06-hold-progress.png` });

    // 7. Desktop Ritual (continue hold until 4000ms threshold completes, submit triggered)
    await page.waitForTimeout(2200);
    await page.keyboard.up("Space");
    await expect(page.getByLabel("Inscription ritual", { exact: true })).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/desktop-07-ritual.png` });

    // 8. Desktop Reveal
    await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByAltText("Your Vanguard Seal")).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/desktop-08-reveal.png` });
  } finally {
    await cleanup();
  }
});

test("Capture Mobile visual release suite (390x844)", async ({ page, context }) => {
  test.setTimeout(120000);
  const screenshotDir = "test-results/vanguard-presentation";
  const cleanup = await account(context);
  try {
    await page.setViewportSize({ width: 390, height: 844 });
    await fixtures(page);

    // 1. Mobile Hero
    await page.goto("/wow-forever/vanguard");
    await expect(
      page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }),
    ).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/mobile-01-hero.png` });

    // 2. Mobile Monument
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    const mobileCanvas = page.getByLabel(
      "Interactive Monument. Drag to pan, scroll or pinch to zoom.",
      { exact: true },
    );
    await expect(mobileCanvas).toBeVisible();
    await expect
      .poll(async () => {
        const stats = await sharp(
          await page
            .getByLabel("Interactive Monument. Drag to pan, scroll or pinch to zoom.", {
              exact: true,
            })
            .screenshot(),
        ).stats();
        return stats.channels.slice(0, 3).every((channel) => channel.stdev > 15);
      })
      .toBe(true);
    await page.screenshot({ path: `${screenshotDir}/mobile-02-monument.png` });

    // 3. Mobile Focus
    await fixtures(page, { existing: true });
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible({
      timeout: 10000,
    });
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotDir}/mobile-03-focus.png` });

    // 4. Mobile Claim
    await fixtures(page, { existing: false });
    await openClaim(page);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `${screenshotDir}/mobile-04-claim.png` });

    // 5. Mobile Hold progress
    const mobileHoldBtn = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await expect(mobileHoldBtn).toBeEnabled({ timeout: 10000 });
    await mobileHoldBtn.focus();
    await page.keyboard.down("Space");
    await page.waitForTimeout(2000);
    await page.screenshot({ path: `${screenshotDir}/mobile-05-hold-progress.png` });

    // 6. Mobile Reveal
    await page.waitForTimeout(2200);
    await page.keyboard.up("Space");
    await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByAltText("Your Vanguard Seal")).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/mobile-06-reveal.png` });
  } finally {
    await cleanup();
  }
});

test("real Hold control cancels early inputs and sends exactly one POST only after 4000ms", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const cleanup = await account(context);
  let posts = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/vanguard/inscriptions"
    )
      posts++;
  });
  try {
    await fixtures(page);
    await openClaim(page);
    await page.clock.install();
    // Advance real timers without rendering every intermediate software-WebGL frame.
    const hold = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await expect(hold).toBeEnabled();
    const rect = await hold.boundingBox();
    if (!rect) throw new Error("Hold missing");
    await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
    for (const duration of [1000, 3000]) {
      await page.mouse.down();
      await page.clock.fastForward(duration);
      await page.mouse.up();
      await page.clock.fastForward(4200);
      expect(posts).toBe(0);
      await expect(page.getByRole("progressbar", { name: "Inscription progress" })).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
    }
    for (const event of ["pointercancel", "touchcancel"]) {
      await page.mouse.down();
      await page.clock.fastForward(2000);
      await hold.dispatchEvent(event);
      await page.mouse.up();
      await page.clock.fastForward(4200);
      expect(posts).toBe(0);
    }
    await hold.focus();
    await page.keyboard.down("Space");
    await page.clock.fastForward(3000);
    await page.keyboard.up("Space");
    await page.clock.fastForward(4200);
    expect(posts).toBe(0);
    await hold.focus();
    await page.keyboard.down("Space");
    await page.clock.fastForward(3999);
    expect(posts).toBe(0);
    await page.clock.fastForward(1);
    await expect.poll(() => posts).toBe(1);
    await page.keyboard.up("Space");
    await expect(page.getByLabel("Inscription ritual", { exact: true })).toBeVisible();
    await page.clock.fastForward(6000);
    await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toHaveCount(1);
    await page.clock.fastForward(6000);
    expect(posts).toBe(1);
  } finally {
    await cleanup();
  }
});

test("Hero hands the same Stage to Canvas without changing its bounds or scrolling", async ({
  page,
}) => {
  await fixtures(page);
  const requests: string[] = [];
  page.on("request", (request) => requests.push(request.url()));
  await page.goto("/wow-forever/vanguard");
  const stage = page.getByRole("region", { name: "Monument Stage", exact: true });
  await expect(stage).toHaveCount(1);
  await expect(stage.locator("img").first()).toBeVisible();
  await expect(stage.locator("canvas")).toHaveCount(0);
  expect(requests.some((url) => /three|mediapipe|hand_landmarker|vision_wasm/.test(url))).toBe(
    false,
  );
  const before = await stage.boundingBox();
  const scroll = await page.evaluate(() => scrollY);
  await stage.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect(stage.locator("canvas")).toHaveCount(1);
  expect(await stage.boundingBox()).toEqual(before);
  expect(await page.evaluate(() => scrollY)).toBe(scroll);
  await expect(stage.getByRole("link", { name: "My Vanguard", exact: true })).toHaveCount(1);
  await expect(page.getByText("Renew Seat Hold", { exact: true })).toHaveCount(0);
});

test("valid Seat deep link enters automatically and Focus stays inside the one Stage", async ({
  page,
}) => {
  await fixtures(page, { existing: true });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  const stage = page.getByRole("region", { name: "Monument Stage", exact: true });
  await expect(stage).toHaveCount(1);
  await expect(stage.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible();
  await expect(stage.locator("canvas")).toHaveCount(1);
  await expect(page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true })).toHaveCount(
    0,
  );
});

test("pending server confirmation cannot show permanent success; a rejected POST returns to ready", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  let release: (() => void) | undefined;
  const confirmation = new Promise<void>((resolve) => {
    release = resolve;
  });
  let posts = 0;
  try {
    await fixtures(page);
    await openClaim(page);
    await page.route("**/api/vanguard/inscriptions", async (route) => {
      posts++;
      await confirmation;
      await route.fulfill({ status: 503, json: { error: { code: "SERVICE_UNAVAILABLE" } } });
    });
    await page.clock.install();
    const button = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await button.focus();
    await page.keyboard.down("Space");
    await page.clock.runFor(4000);
    await expect.poll(() => posts).toBe(1);
    await expect(page.getByText("Sealing · awaiting confirmation…", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Inscription ritual", { exact: true })).toHaveCount(0);
    await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toHaveCount(0);
    release!();
    await page.keyboard.up("Space");
    await expect(
      page.getByRole("region", { name: "Claim your place" }).getByRole("alert"),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Close Claim" })).toBeEnabled();
    await expect(button).toBeEnabled();
    expect(posts).toBe(1);
  } finally {
    release?.();
    await cleanup();
  }
});

test("lost POST response recovers the server-owned Seat through me without resubmitting", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  let posts = 0;
  try {
    await fixtures(page);
    await openClaim(page);
    await page.route("**/api/vanguard/me", (route) =>
      route.fulfill({ json: { inscription: posts ? publicSeat : null } }),
    );
    await page.route("**/api/vanguard/inscriptions", (route) => {
      posts++;
      return route.abort("failed");
    });
    await inscribe(page);
    expect(posts).toBe(1);
    await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toHaveCount(1);
  } finally {
    await cleanup();
  }
});

for (const interruption of ["blur", "visibilitychange"] as const)
  test(`Hold cancels when the document loses continuous input: ${interruption}`, async ({
    page,
    context,
  }) => {
    const cleanup = await account(context);
    let posts = 0;
    page.on("request", (request) => {
      if (
        request.method() === "POST" &&
        new URL(request.url()).pathname === "/api/vanguard/inscriptions"
      )
        posts++;
    });
    try {
      await fixtures(page);
      await openClaim(page);
      await page.clock.install();
      const hold = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
      await hold.focus();
      await page.keyboard.down("Space");
      await page.clock.runFor(2000);
      await page.evaluate((event) => {
        if (event === "visibilitychange") {
          Object.defineProperty(document, "visibilityState", {
            configurable: true,
            get: () => "hidden",
          });
          document.dispatchEvent(new Event("visibilitychange"));
        } else window.dispatchEvent(new Event("blur"));
      }, interruption);
      await page.clock.runFor(5000);
      await page.keyboard.up("Space");
      expect(posts).toBe(0);
      await expect(page.getByRole("progressbar", { name: "Inscription progress" })).toHaveAttribute(
        "aria-valuenow",
        "0",
      );
    } finally {
      await cleanup();
    }
  });

test("stage closure during charge cancels the Hold and leaves archive Search available", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  let posts = 0;
  page.on("request", (request) => {
    if (
      request.method() === "POST" &&
      new URL(request.url()).pathname === "/api/vanguard/inscriptions"
    )
      posts++;
  });
  try {
    await fixtures(page);
    await page.clock.install();
    await openClaim(page);
    let closeStage: (() => void) | undefined;
    const manifestGate = new Promise<void>((resolve) => {
      closeStage = resolve;
    });
    await fixtures(page, { sealed: true, manifestGate });
    const nextPoll = page.waitForRequest("**/api/vanguard/manifest");
    await page.clock.fastForward(16000);
    await nextPoll;
    const hold = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await hold.focus();
    await page.keyboard.down("Space");
    closeStage!();
    await expect(page.getByText("THE MONUMENT IS SEALED", { exact: true })).toBeVisible();
    await page.keyboard.up("Space");
    await page.clock.fastForward(5000);
    expect(posts).toBe(0);
    await expect(page.getByRole("button", { name: "Search", exact: true })).toBeEnabled();
    await expect(page.getByLabel("Inscription charge", { exact: true })).toHaveCount(0);
  } finally {
    await cleanup();
  }
});

test("Focus keyboard traversal wraps around visible controls with Report collapsed and expanded", async ({
  page,
}) => {
  await fixtures(page, { existing: true });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  const close = page.getByRole("button", { name: "Close Focus" });
  const report = page.getByText("Report", { exact: true });
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(report).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
  await report.click();
  await close.focus();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Submit Report" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(close).toBeFocused();
});

test("Reveal preserves the full Monument overview after the accepted Ritual pulls back", async ({
  page,
  context,
}) => {
  test.setTimeout(60000);
  const cleanup = await account(context);
  try {
    await fixtures(page);
    await openClaim(page);
    const canvas = page.getByLabel("Interactive Monument. Drag to pan, scroll or pinch to zoom.", {
      exact: true,
    });
    async function pixels() {
      const url = await canvas.evaluate(
        (node) =>
          new Promise<string>((resolve) =>
            requestAnimationFrame(() =>
              resolve((node as HTMLCanvasElement).toDataURL("image/png")),
            ),
          ),
      );
      return sharp(Buffer.from(url.split(",")[1]!, "base64"))
        .resize(64, 64)
        .removeAlpha()
        .raw()
        .toBuffer();
    }
    await expect
      .poll(
        async () => {
          const stats = await sharp(await pixels(), {
            raw: { width: 64, height: 64, channels: 3 },
          }).stats();
          return stats.channels.slice(0, 3).every((channel) => channel.stdev > 10);
        },
        { timeout: 20000 },
      )
      .toBe(true);
    const before = await pixels();
    await inscribe(page);
    const after = await pixels();
    const meanDifference =
      after.reduce((sum, value, index) => sum + Math.abs(value - before[index]!), 0) / after.length;
    // One newly occupied place can change a few pixels; an 8x Seat focus changes the whole framing.
    expect(meanDifference).toBeLessThan(3);
  } finally {
    await cleanup();
  }
});
