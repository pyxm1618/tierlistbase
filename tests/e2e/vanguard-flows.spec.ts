import { randomBytes, randomUUID } from "node:crypto";
import { expect, test, type Page, type BrowserContext } from "@playwright/test";
import { makeSignature } from "better-auth/crypto";
import { eq } from "drizzle-orm";
import sharp from "sharp";
import { readFile } from "node:fs/promises";
import { createDatabaseClient } from "@/platform/database/client";
import { user, session, accountSubjects } from "@/platform/database/schema";
import { vanguardInscriptions } from "@/modules/wow-vanguard/db/schema";
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
async function accountIdentity(context: BrowserContext) {
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
  const cleanup = async () => {
    await database.db.delete(session).where(eq(session.userId, id));
    await database.db.delete(accountSubjects).where(eq(accountSubjects.authUserId, id));
    await database.db.delete(user).where(eq(user.id, id));
    await database.close();
  };
  return { id, database, cleanup };
}
async function account(context: BrowserContext) {
  return (await accountIdentity(context)).cleanup;
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
    expectNoMediaId?: boolean;
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
      if (options.expectNoMediaId) expect(draft).not.toHaveProperty("mediaId");
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
    if (path.startsWith("search")) {
      const query = (url.searchParams.get("q") ?? "").trim().toLowerCase();
      const matches =
        accepted &&
        [publicSeat.displayName, publicSeat.guildName, publicSeat.seatId].some((value) =>
          value?.toLowerCase().includes(query),
        );
      return route.fulfill({ json: { results: matches ? [publicSeat] : [] } });
    }
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
// Measure inside the browser: CI can spend longer than the animation itself
// between mouse.click(), waitForTimeout(), and a locator query.
async function observePanelFocusTiming(page: Page, onNavigation = false) {
  const observe = () => {
    let startedAt: number | null = null;
    const originalFetch = window.fetch.bind(window);
    window.fetch = (...args) => {
      if (startedAt === null && String(args[0]).includes("/api/vanguard/inscriptions/"))
        startedAt = performance.now();
      return originalFetch(...args);
    };
    document.addEventListener(
      "pointerup",
      (event) => {
        if (event.target instanceof HTMLCanvasElement) startedAt = performance.now();
      },
      true,
    );
    new MutationObserver(() => {
      const panel = document.querySelector<HTMLElement>(
        '[aria-label="Vanguard Focus"], [aria-label="Claim authentication"], [aria-label="Claim your place"]',
      );
      if (panel && startedAt !== null && !panel.hasAttribute("data-test-focus-elapsed"))
        panel.setAttribute("data-test-focus-elapsed", String(performance.now() - startedAt));
    }).observe(document, { childList: true, subtree: true });
  };
  if (onNavigation) await page.addInitScript(observe);
  else await page.evaluate(observe);
}

async function expectFocusedPanel(page: Page, name: string) {
  const panel = page.getByRole("region", { name, exact: true });
  await expect(panel).toBeVisible();
  await expect(panel).toHaveAttribute("data-test-focus-elapsed", /.+/);
  expect(Number(await panel.getAttribute("data-test-focus-elapsed"))).toBeGreaterThanOrEqual(550);
}

async function openSearch(page: Page) {
  const close = page.getByRole("button", { name: "Close Focus", exact: true });
  if (await close.isVisible()) await close.click();
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByLabel("Vanguard name or guild")).toBeVisible();
}
async function seatCanvasPoint(page: Page, targetSeatId: string) {
  const [, letter, rawIndex] = targetSeatId.split("-");
  const localIndex = Number(rawIndex) - 1;
  const letters = ["W1", "O", "W2"] as const;
  const layouts = await Promise.all(
    letters.map(async (candidate) => {
      const bytes = await readFile(`public/wow-forever/vanguard/layouts/wow-${candidate}.f32`);
      return {
        letter: candidate,
        positions: new Float32Array(bytes.buffer, bytes.byteOffset, bytes.byteLength / 4),
      };
    }),
  );
  let minX = Infinity,
    maxX = -Infinity,
    minY = Infinity,
    maxY = -Infinity;
  for (const layout of layouts)
    for (let i = 0; i < layout.positions.length; i += 4) {
      minX = Math.min(minX, layout.positions[i]!);
      maxX = Math.max(maxX, layout.positions[i]!);
      minY = Math.min(minY, layout.positions[i + 1]!);
      maxY = Math.max(maxY, layout.positions[i + 1]!);
    }
  const layout = layouts.find((candidate) => candidate.letter === letter);
  if (!layout || !Number.isInteger(localIndex) || localIndex < 0)
    throw new Error("Invalid test Seat");
  const offset = localIndex * 4;
  const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
    exact: true,
  });
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => canvas.evaluate((node) => Number(getComputedStyle(node).opacity)))
    .toBe(1);
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error("Canvas missing");
  const aspect = rect.width / rect.height;
  const backgroundWidth = 167.2;
  const backgroundHeight = 94.1;
  const subjectHeight = maxY - minY + 4;
  const subjectWidthAsHeight = (maxX - minX + 4) / aspect;
  const backgroundFrame =
    rect.width < 768
      ? Math.max(backgroundHeight, backgroundWidth / aspect)
      : Math.min(backgroundHeight, backgroundWidth / aspect);
  const frameHeight = Math.max(backgroundFrame, subjectHeight, subjectWidthAsHeight);
  const worldX = layout.positions[offset]!;
  const worldY = layout.positions[offset + 1]!;
  return {
    x: rect.x + ((worldX / ((frameHeight * aspect) / 2) + 1) / 2) * rect.width,
    y: rect.y + ((1 - worldY / (frameHeight / 2)) / 2) * rect.height,
  };
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
    // This viewport also renders and downloads both full-resolution Seal formats.
    if (width === 1920) test.setTimeout(60000);
    const cleanup = await account(context);
    try {
      await page.setViewportSize({ width, height: 900 });
      await fixtures(page, { longText: width === 1920, expectNoMediaId: true });
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
      const reveal = page.getByRole("region", { name: "Vanguard Reveal", exact: true });
      await expect(reveal.getByAltText("Mage Default Emblem")).toHaveCount(1);
      await expect(reveal.getByAltText("Your Vanguard Seal")).toBeVisible({ timeout: 15000 });
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
test("pre-HOLD validation blocks every invalid client-verifiable Claim state", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  try {
    await fixtures(page);
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    const hold = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await expect(hold).toBeDisabled();

    await page.getByLabel("Vanguard Name", { exact: true }).fill("A");
    await page.getByLabel("Faction", { exact: true }).selectOption("horde");
    await page.getByLabel("Class", { exact: true }).selectOption("Mage");
    await expect(hold).toBeDisabled();

    await page.getByLabel("Vanguard Name", { exact: true }).fill("Chosen Vanguard");
    await expect(hold).toBeEnabled();

    await page.getByLabel("Guild (optional)").fill("https://example.com");
    await expect(hold).toBeDisabled();
    await page.getByLabel("Guild (optional)").fill("Test Guild");
    await expect(hold).toBeEnabled();

    await page.getByLabel("Battle Cry (optional)").fill("hero@example.com");
    await expect(hold).toBeDisabled();
    await page.getByLabel("Battle Cry (optional)").fill("For Azeroth");
    await expect(hold).toBeEnabled();

    await page.getByLabel("Faction", { exact: true }).selectOption("");
    await expect(hold).toBeDisabled();
    await page.getByLabel("Faction", { exact: true }).selectOption("horde");
    await page.getByLabel("Class", { exact: true }).selectOption("");
    await expect(hold).toBeDisabled();
    await page.getByLabel("Class", { exact: true }).selectOption("Mage");
    await page.getByLabel("Vanguard Name", { exact: true }).fill("");
    await expect(hold).toBeDisabled();
  } finally {
    await cleanup();
  }
});

test("custom Memory Image can be cleared back to the Mage Default Emblem without mediaId", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  try {
    await fixtures(page, { media: "approved", expectNoMediaId: true });
    await openClaim(page);
    const image = await sharp({
      create: { width: 1024, height: 768, channels: 3, background: "blue" },
    })
      .png()
      .toBuffer();
    await page
      .getByLabel("Choose Memory Image")
      .setInputFiles({ name: "synthetic.png", mimeType: "image/png", buffer: image });
    await page.getByRole("button", { name: "Upload square crop" }).click();
    await expect(page.getByText("Image approved")).toBeVisible();
    await page.getByRole("button", { name: "Use Class Default Emblem" }).click();
    await expect(page.getByText("Image approved")).toHaveCount(0);
    await expect(page.getByText("Using Mage Default Emblem.", { exact: true })).toBeVisible();
    await expect(page.getByLabel("Square crop preview", { exact: true })).toHaveCount(0);
    await inscribe(page);
    const reveal = page.getByRole("region", { name: "Vanguard Reveal", exact: true });
    await expect(reveal.getByAltText("Mage Default Emblem")).toHaveCount(1);
    await expect(reveal.getByAltText("Memory Image")).toHaveCount(0);
  } finally {
    await cleanup();
  }
});

test("My Vanguard renders the Class Default Emblem when the saved inscription has no media", async ({
  page,
  context,
}) => {
  const identity = await accountIdentity(context);
  try {
    await identity.database.db.insert(vanguardInscriptions).values({
      userId: identity.id,
      seatId: "WOW-W1-0009",
      phase: "wow",
      letter: "W1",
      localIndex: 9,
      displayName: "Account Vanguard",
      faction: "horde",
      className: "Mage",
      guildName: "Test Guild",
      battleCry: "For Azeroth",
    });
    await page.goto("/account/vanguard");
    await expect(page.getByRole("heading", { name: "My Vanguard", exact: true })).toBeVisible();
    await expect(page.getByAltText("Mage Default Emblem")).toHaveCount(1);
    await expect(page.getByAltText("Memory Image")).toHaveCount(0);
  } finally {
    await identity.database.db
      .delete(vanguardInscriptions)
      .where(eq(vanguardInscriptions.userId, identity.id));
    await identity.cleanup();
  }
});

test("sealed polling leaves public Focus, share and Tier List available and blocks Claim", async ({
  page,
}) => {
  await fixtures(page, { sealed: true, existing: true });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  const focus = page.getByRole("region", { name: "Vanguard Focus", exact: true });
  await expect(focus).toBeVisible({ timeout: 10000 });
  await expect(page.getByText("THE MONUMENT IS SEALED", { exact: true })).toBeVisible({
    timeout: 20000,
  });
  await expect(focus.getByRole("button", { name: "STAND BESIDE ME" })).toBeEnabled();
  await expect(focus.getByRole("link", { name: "View Mage Tier List" })).toBeVisible();
  await expect(page.getByRole("region", { name: "Claim your place", exact: true })).toHaveCount(0);
  expect(await page.getByRole("region", { name: "Claim authentication" }).count()).toBe(0);
});
test("Google is the only sign-in action in the Vanguard profile", async ({ page }) => {
  await page.goto("/sign-in");
  await expect(
    page.getByRole("button", { name: "Continue with Google", exact: true }),
  ).toBeVisible();
  await expect(page.getByLabel("Email address")).toHaveCount(0);
  await expect(page.getByRole("textbox", { name: /password/i })).toHaveCount(0);
});

test("Vanguard Header sign-in preserves the route and a valid Seat deep link", async ({ page }) => {
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute(
    "href",
    "/sign-in?returnTo=%2Fwow-forever%2Fvanguard",
  );

  await page.goto("/wow-forever/vanguard?seat=WOW-W1-0001");
  await expect(page.getByRole("link", { name: "Sign in", exact: true })).toHaveAttribute(
    "href",
    "/sign-in?returnTo=%2Fwow-forever%2Fvanguard%3Fseat%3DWOW-W1-0001",
  );
});

test("Escape during Seat focus cancels the pending panel", async ({ page }) => {
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
    exact: true,
  });
  await expect
    .poll(() => canvas.evaluate((node) => Number(getComputedStyle(node).opacity)))
    .toBe(1);
  // One browser task guarantees Escape lands while the focus animation is pending.
  await canvas.evaluate((node) => {
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    node.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
  });
  await page.waitForTimeout(900);
  await expect(page.getByRole("region", { name: "Claim authentication" })).toHaveCount(0);
  await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toHaveCount(0);
});

test("FOREVER Search waits for the WOW scene to focus before opening a WOW inscription", async ({
  page,
}) => {
  test.setTimeout(90000);
  await fixtures(page, { stage: "FOREVER_OPEN", existing: true });
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
    exact: true,
  });
  await expect
    .poll(() => canvas.evaluate((node) => Number(getComputedStyle(node).opacity)), {
      timeout: 20000,
    })
    .toBe(1);
  await expect(
    page.getByRole("status").filter({ hasText: "Selected Seat FOREVER-F-0001" }),
  ).toHaveCount(1, { timeout: 20000 });
  await expect
    .poll(() => canvas.evaluate((node) => Number(getComputedStyle(node).opacity)), {
      timeout: 20000,
    })
    .toBe(1);
  await openSearch(page);
  await page.getByLabel("Vanguard name or guild").fill("Chosen");
  await page.getByRole("button", { name: "Search", exact: true }).last().click();
  let releaseLayout!: () => void;
  const layoutGate = new Promise<void>((resolve) => {
    releaseLayout = resolve;
  });
  await page.route("**/layouts/wow-*.f32", async (route) => {
    await layoutGate;
    await route.continue();
  });
  try {
    const layoutRequest = page.waitForRequest("**/layouts/wow-W1.f32");
    await page.getByRole("button", { name: /Chosen Vanguard/ }).click();
    await layoutRequest;
    await page.waitForTimeout(100);
    await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toHaveCount(0);
  } finally {
    releaseLayout();
  }
  await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible();
  await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toContainText(
    seatId,
  );
});

test("editing Claim fields while the Hold resolves preserves the Hold token", async ({
  page,
  context,
}) => {
  await page.addInitScript(() => {
    const originalFetch = window.fetch.bind(window);
    let injected = false;
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      if (!injected && String(args[0]).endsWith("/api/vanguard/holds")) {
        injected = true;
        const originalJson = response.json.bind(response);
        response.json = async () => {
          const payload = await originalJson();
          // Place a real field change after the Hold state update is queued but
          // before React commits its render, reproducing the network/input race.
          queueMicrotask(() =>
            queueMicrotask(() =>
              queueMicrotask(() => {
                const field = document.querySelector<HTMLSelectElement>(
                  'select[aria-label="Class"]',
                );
                if (!field) throw new Error("Claim Class field is missing");
                field.value = "Mage";
                field.dispatchEvent(new Event("change", { bubbles: true }));
              }),
            ),
          );
          return payload;
        };
      }
      return response;
    };
  });
  const cleanup = await account(context);
  try {
    await fixtures(page);
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await expect(page.getByLabel("Class", { exact: true })).toHaveValue("Mage");
    await page.getByLabel("Vanguard Name", { exact: true }).fill("Chosen Vanguard");
    await page.getByLabel("Faction", { exact: true }).selectOption("horde");
    await expect(page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true })).toBeEnabled();
  } finally {
    await cleanup();
  }
});

test("keyboard users can select an empty Seat and reach Claim authentication", async ({ page }) => {
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).press("Enter");
  const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
    exact: true,
  });
  await expect
    .poll(() => canvas.evaluate((node) => Number(getComputedStyle(node).opacity)))
    .toBe(1);
  await canvas.focus();
  await expect(canvas).toBeFocused();
  await expect(canvas).toHaveAttribute("tabindex", "0");
  await canvas.press("End");
  await expect(
    page.getByRole("status").filter({ hasText: "Selected Seat WOW-W2-2672" }),
  ).toBeVisible();
  await canvas.press("ArrowRight");
  await expect(
    page.getByRole("status").filter({ hasText: "Selected Seat WOW-W1-0001" }),
  ).toBeVisible();
  await canvas.press("ArrowRight");
  await expect(
    page.getByRole("status").filter({ hasText: "Selected Seat WOW-W1-0002" }),
  ).toBeVisible();
  await canvas.press("Enter");
  await expect(page.getByRole("region", { name: "Claim authentication" })).toBeVisible();
  await expect(
    page.getByRole("link", { name: "Continue with Google", exact: true }),
  ).toHaveAttribute("href", "/sign-in?returnTo=%2Fwow-forever%2Fvanguard%3Fseat%3DWOW-W1-0002");
});

test("unauthenticated empty Seat click focuses first, keeps the Hold, and shows only the Authentication Gate", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();

  const emptySeat = "WOW-W1-0003";
  const point = await seatCanvasPoint(page, emptySeat);
  const holdRequest = page.waitForRequest("**/api/vanguard/holds");
  await observePanelFocusTiming(page);
  await page.mouse.click(point.x, point.y);

  await expectFocusedPanel(page, "Claim authentication");

  const gate = page.getByRole("region", { name: "Claim authentication" });
  await expect(gate).toBeVisible({ timeout: 1000 });
  await holdRequest;
  await expect(gate.getByRole("heading", { name: "Claim this place", exact: true })).toBeVisible();
  await expect(
    gate.getByText("Sign in with Google to claim this place in the Monument.", { exact: true }),
  ).toBeVisible();
  await expect(
    gate.getByRole("link", { name: "Continue with Google", exact: true }),
  ).toHaveAttribute("href", "/sign-in?returnTo=%2Fwow-forever%2Fvanguard%3Fseat%3DWOW-W1-0003");
  await expect(page.getByLabel("Vanguard Name", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Faction", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Class", { exact: true })).toHaveCount(0);
  await expect(page.getByLabel("Guild (optional)")).toHaveCount(0);
  await expect(page.getByLabel("Battle Cry (optional)")).toHaveCount(0);
  await expect(page.getByLabel("Choose Memory Image")).toHaveCount(0);
  await expect(page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true })).toHaveCount(0);
});

test("OAuth return to the original empty Seat revalidates it, focuses it, and opens Claim only after authentication", async ({
  page,
  context,
}) => {
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();

  const point = await seatCanvasPoint(page, seatId);
  await page.mouse.click(point.x, point.y);
  await expect(page.getByRole("region", { name: "Claim authentication" })).toBeVisible({
    timeout: 1000,
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = sessionStorage.getItem("tierlistbase:vanguard:draft");
        return raw ? JSON.parse(raw).seatId : null;
      }),
    )
    .toBe(seatId);

  const cleanup = await account(context);
  try {
    await observePanelFocusTiming(page, true);
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await expectFocusedPanel(page, "Claim your place");
    await expect(page.getByRole("heading", { name: `Claim ${seatId}`, exact: true })).toBeVisible({
      timeout: 1000,
    });
    expect(await page.getByRole("region", { name: "Claim authentication" }).count()).toBe(0);
    await expect(page.getByLabel("Vanguard Name", { exact: true })).toBeVisible();
  } finally {
    await cleanup();
  }
});

test("OAuth return uses existing Seat conflict and nearest-Seat handling if the original Seat was taken", async ({
  page,
  context,
}) => {
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();

  const point = await seatCanvasPoint(page, seatId);
  await page.mouse.click(point.x, point.y);
  await expect(page.getByRole("region", { name: "Claim authentication" })).toBeVisible({
    timeout: 1000,
  });
  await expect
    .poll(() =>
      page.evaluate(() => {
        const raw = sessionStorage.getItem("tierlistbase:vanguard:draft");
        return raw ? JSON.parse(raw).seatId : null;
      }),
    )
    .toBe(seatId);

  const cleanup = await account(context);
  try {
    await page.route(`**/api/vanguard/inscriptions/${seatId}`, (route) =>
      route.fulfill({ json: publicSeat }),
    );
    await page.route("**/api/vanguard/holds", (route) =>
      route.fulfill({
        status: 409,
        json: { error: { code: "SEAT_ALREADY_CLAIMED", nearestSeatId: "WOW-W1-0003" } },
      }),
    );

    const conflictResponse = page.waitForResponse(
      (response) =>
        response.url().endsWith("/api/vanguard/holds") && response.status() === 409,
    );
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    await conflictResponse;
    await expect(page.getByText("This place was just claimed.", { exact: false })).toBeVisible({
      timeout: 10000,
    });
    await expect(
      page.getByRole("button", { name: "Choose nearby seat WOW-W1-0003", exact: true }),
    ).toBeVisible();
  } finally {
    await cleanup();
  }
});

test("authenticated Header exposes identity and a controlled keyboard-safe profile menu", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  try {
    await fixtures(page);
    await page.goto("/wow-forever/vanguard");
    const trigger = page.getByRole("button", { name: /Private Google identity/ });
    await expect(trigger).toBeVisible();
    await trigger.click();
    const menu = page.getByRole("menu", { name: "Account menu" });
    await expect(menu).toBeVisible();
    await expect(menu.getByText("Private Google identity", { exact: true })).toBeVisible();
    await expect(menu.getByText(/@example\.test$/)).toBeVisible();

    await page.locator("main").click({ position: { x: 10, y: 10 } });
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await page.keyboard.press("Escape");
    await expect(menu).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await menu.getByRole("menuitem", { name: "My Account", exact: true }).click();
    await expect(page).toHaveURL(/\/account$/);
    await expect(menu).toHaveCount(0);
  } finally {
    await cleanup();
  }
});

test("Vanguard has no Camera or Gesture Control and inherits camera=()", async ({ page }) => {
  await fixtures(page);
  const response = await page.goto("/wow-forever/vanguard");
  expect(response?.headers()["permissions-policy"]).toContain("camera=()");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect(page.getByRole("button", { name: /Gesture Control/ })).toHaveCount(0);
  await expect(page.locator("video")).toHaveCount(0);
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
    expect(await page.getByRole("region", { name: "Claim your place" }).count()).toBe(0);
  } finally {
    await cleanup();
  }
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
  expect(await page.getByRole("region", { name: "Claim your place" }).count()).toBe(0);
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
    await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
    expect(await page.getByRole("region", { name: "Claim your place" }).count()).toBe(0);
    await expect(
      page.getByRole("link", { name: "WoW Forever Tier List", exact: true }).first(),
    ).toBeVisible();
  });

test("Music defaults On without persisting and keeps Focus SFX independent", async ({ page }) => {
  const sounds: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".wav")) sounds.push(request.url().split("/").at(-1)!);
  });
  await fixtures(page, { existing: true });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  await expect(page.getByRole("region", { name: "Vanguard Focus" })).toBeVisible();
  await expect(page.getByRole("button", { name: "Music On", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("tierlistbase:vanguard:music"))).toBeNull();
  expect(sounds).toEqual([]);

  await page.getByRole("button", { name: "Close Focus" }).click();
  await expect.poll(() => sounds.includes("vanguard-ambient-theme.wav")).toBe(true);

  await page.getByRole("button", { name: "Music On", exact: true }).click();
  await expect(page.getByRole("button", { name: "Music Off", exact: true })).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("tierlistbase:vanguard:music"))).toBe("0");

  await openSearch(page);
  await page.getByLabel("Vanguard name or guild").fill("Chosen Vanguard");
  await page.getByRole("button", { name: "Search", exact: true }).last().click();
  const result = page.getByRole("button", { name: /Chosen Vanguard/ });
  await expect(result).toBeVisible();
  await result.click();
  await expect(page.getByRole("region", { name: "Vanguard Focus" })).toBeVisible();
  await expect.poll(() => sounds.includes("vanguard-focus-open.wav")).toBe(true);
  await expect(page.getByRole("button", { name: "Music Off", exact: true })).toBeVisible();
});

test("stored Music Off remains Off and stored Music On starts on ENTER", async ({ page }) => {
  const sounds: string[] = [];
  page.on("request", (request) => {
    if (request.url().endsWith(".wav")) sounds.push(request.url().split("/").at(-1)!);
  });

  await page.addInitScript(() => {
    if (localStorage.getItem("tierlistbase:vanguard:music") === null)
      localStorage.setItem("tierlistbase:vanguard:music", "0");
  });
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await expect(page.getByRole("button", { name: "Music Off", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await page.waitForTimeout(300);
  expect(sounds.includes("vanguard-ambient-theme.wav")).toBe(false);

  await page.evaluate(() => localStorage.setItem("tierlistbase:vanguard:music", "1"));
  await page.reload();
  await expect(page.getByRole("button", { name: "Music On", exact: true })).toBeVisible();
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect.poll(() => sounds.includes("vanguard-ambient-theme.wav")).toBe(true);
});

test("BGM load failure is explicit and leaves Monument browsing usable", async ({ page }) => {
  await page.route("**/audio/vanguard-ambient-theme.wav", (route) =>
    route.fulfill({ status: 503, body: "fixture unavailable" }),
  );
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect(
    page.getByText("The background music could not load.", { exact: false }),
  ).toBeVisible();
  await expect(page.getByRole("button", { name: "Search", exact: true })).toBeEnabled();
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
    await page.goto("/wow-forever/vanguard?seat=WOW-W1-0003");
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

test("Search is inscription-only, renders identity fields, and has no Focus Seat action", async ({
  page,
}) => {
  await fixtures(page, { existing: true });
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(page.getByRole("button", { name: "Focus Seat", exact: true })).toHaveCount(0);
  await page.getByLabel("Vanguard name or guild").fill("Chosen Vanguard");
  await page.getByRole("button", { name: "Search", exact: true }).last().click();
  const result = page.getByRole("button", { name: /Chosen Vanguard/ });
  await expect(result).toContainText("Chosen Vanguard");
  await expect(result).toContainText("Test Guild");
  await expect(result).toContainText(seatId);
  await result.click();
  await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible();
  expect(await page.getByRole("region", { name: "Claim authentication" }).count()).toBe(0);
});

test("Search shows explicit zero-inscription and no-match empty states", async ({ page }) => {
  test.setTimeout(60000);
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await expect(
    page.getByText("No Vanguards have been inscribed yet.", { exact: false }),
  ).toBeVisible();

  await fixtures(page, { existing: true });
  await page.reload();
  // The lazy experience is initially absent. Its absence is not evidence that
  // the server manifest has refreshed from zero to the fixture's one inscription.
  const manifestResponse = page.waitForResponse("**/api/vanguard/manifest");
  await page.getByRole("button", { name: "Search", exact: true }).click();
  await manifestResponse;
  await expect(
    page.getByText("No Vanguards have been inscribed yet.", { exact: false }),
  ).toHaveCount(0, { timeout: 20000 });
  await page.getByLabel("Vanguard name or guild").fill("Nobody");
  await page.getByRole("button", { name: "Search", exact: true }).last().click();
  await expect(page.getByText("No matching Vanguard found.", { exact: true })).toBeVisible();
});

test("occupied and empty Seat clicks finish smooth focus before opening their panels", async ({
  page,
}) => {
  await page.setViewportSize({ width: 1920, height: 1080 });

  await fixtures(page, { existing: true });
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  await expect(
    page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", { exact: true }),
  ).toBeVisible();
  const occupiedPoint = await seatCanvasPoint(page, seatId);
  await observePanelFocusTiming(page);
  await page.mouse.click(occupiedPoint.x, occupiedPoint.y);
  await expectFocusedPanel(page, "Vanguard Focus");
  await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible({
    timeout: 1000,
  });

  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  const emptyPoint = await seatCanvasPoint(page, "WOW-W1-0003");
  await observePanelFocusTiming(page);
  await page.mouse.click(emptyPoint.x, emptyPoint.y);
  await expectFocusedPanel(page, "Claim authentication");
  await expect(page.getByRole("region", { name: "Claim authentication" })).toBeVisible({
    timeout: 1000,
  });
});

test("authenticated empty Seat click focuses first and opens the existing Claim form directly", async ({
  page,
  context,
}) => {
  const cleanup = await account(context);
  try {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await fixtures(page);
    await page.goto("/wow-forever/vanguard");
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    const point = await seatCanvasPoint(page, "WOW-W1-0003");
    await observePanelFocusTiming(page);
    await page.mouse.click(point.x, point.y);
    await expectFocusedPanel(page, "Claim your place");
    await expect(page.getByRole("heading", { name: "Claim WOW-W1-0003", exact: true })).toBeVisible(
      { timeout: 1000 },
    );
    expect(await page.getByRole("region", { name: "Claim authentication" }).count()).toBe(0);
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
  const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
    exact: true,
  });
  await expect(canvas).toBeVisible();
  await expect
    .poll(() => canvas.evaluate((node) => (node as HTMLCanvasElement).width), {
      timeout: 25000,
    })
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
    const heroArtwork = page.locator(".vanguard-heroArtwork");
    await expect(heroArtwork).toBeVisible();
    expect(await heroArtwork.evaluate((node) => getComputedStyle(node).objectFit)).toBe("cover");
    await page.screenshot({ path: `${screenshotDir}/desktop-01-hero.png` });

    // 2. Desktop Header Profile Menu
    const profileTrigger = page.getByRole("button", { name: /Private Google identity/ });
    await profileTrigger.click();
    await expect(page.getByRole("menu", { name: "Account menu" })).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/desktop-02-header-menu.png` });
    await page.keyboard.press("Escape");

    // 3. Ultra-wide Hero
    await page.setViewportSize({ width: 2560, height: 1080 });
    expect(await heroArtwork.evaluate((node) => getComputedStyle(node).objectFit)).toBe("cover");
    await page.screenshot({ path: `${screenshotDir}/desktop-03-hero-2560.png` });
    await page.setViewportSize({ width: 1920, height: 1080 });

    // 4. Desktop Entered Monument
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
      exact: true,
    });
    await expect(canvas).toBeVisible();
    await expect
      .poll(async () => {
        const stats = await sharp(
          await page
            .getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
              exact: true,
            })
            .screenshot(),
        ).stats();
        return stats.channels.slice(0, 3).every((channel) => channel.stdev > 15);
      })
      .toBe(true);
    await page.screenshot({ path: `${screenshotDir}/desktop-04-entered-monument.png` });

    // 5. Desktop Search Overlay
    await page.getByRole("button", { name: "Search", exact: true }).click();
    await expect(page.getByLabel("Vanguard name or guild")).toBeVisible();
    await page.getByLabel("Vanguard name or guild").fill("Chosen Vanguard");
    await page.keyboard.press("Enter");
    await page.waitForTimeout(600);
    await page.screenshot({ path: `${screenshotDir}/desktop-05-search.png` });

    // 6. Desktop Occupied Seat Focus from an actual Monument click
    await fixtures(page, { existing: true });
    await page.goto("/wow-forever/vanguard");
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    const occupiedPoint = await seatCanvasPoint(page, seatId);
    await page.mouse.click(occupiedPoint.x, occupiedPoint.y);
    await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible({
      timeout: 1500,
    });
    await page.screenshot({ path: `${screenshotDir}/desktop-06-occupied-focus.png` });

    // 7. Desktop Empty Seat Focus + Claim from an actual Monument click
    await fixtures(page, { existing: false });
    await page.goto("/wow-forever/vanguard");
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    const emptyPoint = await seatCanvasPoint(page, "WOW-W1-0003");
    await page.mouse.click(emptyPoint.x, emptyPoint.y);
    await expect(page.getByRole("heading", { name: "Claim WOW-W1-0003", exact: true })).toBeVisible(
      {
        timeout: 1500,
      },
    );
    await page.screenshot({ path: `${screenshotDir}/desktop-07-empty-seat-claim.png` });
    await page.getByLabel("Vanguard Name", { exact: true }).fill("Chosen Vanguard");
    await page.getByLabel("Faction", { exact: true }).selectOption("horde");
    await page.getByLabel("Class", { exact: true }).selectOption("Mage");

    // 8. Desktop Hold progress
    const holdBtn = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await expect(holdBtn).toBeEnabled({ timeout: 10000 });
    await holdBtn.focus();
    await page.clock.install();
    await page.clock.pauseAt(new Date(Date.now() + 100));
    await page.keyboard.down("Space");
    await page.clock.fastForward(2000);
    await page.screenshot({ path: `${screenshotDir}/desktop-08-hold-progress.png` });

    // 9. Desktop Ritual (continue hold until 4000ms threshold completes, submit triggered)
    await page.clock.fastForward(2000);
    await page.keyboard.up("Space");
    await expect(page.getByLabel("Inscription ritual", { exact: true })).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/desktop-09-ritual.png` });
    await page.clock.resume();

    // 10. Desktop Reveal
    await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toBeVisible({
      timeout: 15000,
    });
    await expect(page.getByAltText("Your Vanguard Seal")).toBeVisible();
    await page.screenshot({ path: `${screenshotDir}/desktop-10-reveal.png` });
  } finally {
    await cleanup();
  }
});

test.describe("Mobile visual capture", () => {
  // Set the viewport before Playwright creates the page and its compositor surface.
  test.use({ viewport: { width: 390, height: 844 } });

  test("Capture Mobile visual release suite (390x844)", async ({ page, context }) => {
    test.setTimeout(120000);
    const screenshotDir = "test-results/vanguard-presentation";
    const cleanup = await account(context);
    try {
      await fixtures(page);

      // 1. Mobile Hero
      await page.goto("/wow-forever/vanguard");
      await expect(
        page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }),
      ).toBeVisible();
      const mobileHeroArtwork = page.locator(".vanguard-heroArtwork");
      await expect(mobileHeroArtwork).toBeVisible();
      expect(await mobileHeroArtwork.evaluate((node) => getComputedStyle(node).objectFit)).toBe(
        "contain",
      );
      // Capture only after the artwork is decoded and the final viewport has painted.
      await mobileHeroArtwork.evaluate(async (node) => {
        await (node as HTMLImageElement).decode();
        await new Promise<void>((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(() => resolve())),
        );
      });
      await page.screenshot({ path: `${screenshotDir}/mobile-01-hero.png` });

      // 2. Mobile Header / Menu
      const mobileMenu = page.locator("header summary").filter({ hasText: "Menu" });
      await mobileMenu.click();
      await expect(
        page.getByLabel("Mobile navigation").getByText("Private Google identity", { exact: true }),
      ).toBeVisible();
      await page.screenshot({ path: `${screenshotDir}/mobile-02-header-menu.png` });
      await mobileMenu.click();

      // 3. Mobile Monument
      await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
      const mobileCanvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
        exact: true,
      });
      await expect(mobileCanvas).toBeVisible();
      await expect
        .poll(async () => {
          const stats = await sharp(
            await page
              .getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
                exact: true,
              })
              .screenshot(),
          ).stats();
          return stats.channels.slice(0, 3).every((channel) => channel.stdev > 15);
        })
        .toBe(true);
      await page.screenshot({ path: `${screenshotDir}/mobile-03-monument.png` });

      // 4. Mobile Search
      await page.getByRole("button", { name: "Search", exact: true }).click();
      await expect(page.getByLabel("Vanguard name or guild")).toBeVisible();
      await page.screenshot({ path: `${screenshotDir}/mobile-04-search.png` });
      await page.keyboard.press("Escape");

      // 5. Mobile Focus
      await fixtures(page, { existing: true });
      await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
      await expect(page.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible({
        timeout: 10000,
      });
      await page.screenshot({ path: `${screenshotDir}/mobile-05-focus.png` });

      // 6. Mobile Claim from an actual Monument click
      await fixtures(page, { existing: false });
      await page.goto("/wow-forever/vanguard");
      await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
      const mobileEmptyPoint = await seatCanvasPoint(page, "WOW-W1-0003");
      await page.mouse.click(mobileEmptyPoint.x, mobileEmptyPoint.y);
      await expect(
        page.getByRole("heading", { name: "Claim WOW-W1-0003", exact: true }),
      ).toBeVisible({
        timeout: 1500,
      });
      await page.screenshot({ path: `${screenshotDir}/mobile-06-claim.png` });
      await page.getByLabel("Vanguard Name", { exact: true }).fill("Chosen Vanguard");
      await page.getByLabel("Faction", { exact: true }).selectOption("horde");
      await page.getByLabel("Class", { exact: true }).selectOption("Mage");

      // 7. Mobile Hold progress
      const mobileHoldBtn = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
      await expect(mobileHoldBtn).toBeEnabled({ timeout: 10000 });
      await mobileHoldBtn.focus();
      await page.keyboard.down("Space");
      await page.waitForTimeout(2000);
      await page.screenshot({ path: `${screenshotDir}/mobile-07-hold-progress.png` });

      // 8. Mobile Reveal
      await page.waitForTimeout(2200);
      await page.keyboard.up("Space");
      await expect(page.getByRole("region", { name: "Vanguard Reveal", exact: true })).toBeVisible({
        timeout: 15000,
      });
      await expect(page.getByAltText("Your Vanguard Seal")).toBeVisible();
      await page.screenshot({ path: `${screenshotDir}/mobile-08-reveal.png` });
    } finally {
      await cleanup();
    }
  });
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
  await expect(
    stage.getByText(
      "A limited-time community tribute before WoW Forever launches — leave one permanent Seat.",
      { exact: true },
    ),
  ).toBeVisible();
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

test("valid Seat deep link enters automatically, highlights nearby availability, and clears it on Focus close", async ({
  page,
}) => {
  await fixtures(page, { existing: true });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  const stage = page.getByRole("region", { name: "Monument Stage", exact: true });
  await expect(stage).toHaveCount(1);
  await expect(stage.getByRole("region", { name: "Vanguard Focus", exact: true })).toBeVisible();
  await expect(stage.getByRole("region", { name: "Claim authentication" })).toHaveCount(0);
  await expect(stage.locator("canvas")).toHaveCount(1);
  const nearby = stage.getByRole("complementary", { name: "Nearby available places" });
  await expect(nearby).toBeVisible();
  await expect(nearby.getByRole("button")).toHaveCount(4);
  await stage.getByRole("button", { name: "Close Focus", exact: true }).click();
  await expect(nearby).toHaveCount(0);
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
    await fixtures(page, { media: "approved" });
    await openClaim(page);
    const image = await sharp({
      create: { width: 1024, height: 768, channels: 3, background: "blue" },
    })
      .png()
      .toBuffer();
    await page
      .getByLabel("Choose Memory Image")
      .setInputFiles({ name: "submission-lock.png", mimeType: "image/png", buffer: image });
    await page.getByRole("button", { name: "Upload square crop" }).click();
    await expect(page.getByText("Image approved")).toBeVisible();
    const cropPreview = page.getByLabel("Square crop preview", { exact: true });
    await expect(cropPreview).toHaveAttribute("aria-disabled", "false");
    await page.route("**/api/vanguard/inscriptions", async (route) => {
      posts++;
      await confirmation;
      await route.fulfill({ status: 503, json: { error: { code: "SERVICE_UNAVAILABLE" } } });
    });
    await page.clock.install();
    const button = page.getByRole("button", { name: "HOLD TO INSCRIBE", exact: true });
    await button.focus();
    await page.keyboard.down("Space");
    await page.clock.fastForward(4000);
    await expect.poll(() => posts).toBe(1);
    await expect(page.getByText("Sealing · awaiting confirmation…", { exact: true })).toBeVisible();
    for (const label of [
      "Vanguard Name",
      "Faction",
      "Class",
      "Guild (optional)",
      "Battle Cry (optional)",
      "Choose Memory Image",
    ])
      await expect(page.getByLabel(label, { exact: true })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Use Class Default Emblem" })).toBeDisabled();
    await expect(page.getByRole("button", { name: "Upload square crop" })).toBeDisabled();
    await expect(page.getByRole("slider", { name: "Zoom", exact: true })).toBeDisabled();
    await expect(cropPreview).toHaveAttribute("aria-disabled", "true");
    await expect(cropPreview).toHaveAttribute("tabindex", "-1");
    await expect(button).toBeDisabled();
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
      await page.clock.fastForward(2000);
      await page.evaluate((event) => {
        if (event === "visibilitychange") {
          Object.defineProperty(document, "visibilityState", {
            configurable: true,
            get: () => "hidden",
          });
          document.dispatchEvent(new Event("visibilitychange"));
        } else window.dispatchEvent(new Event("blur"));
      }, interruption);
      await page.clock.fastForward(5000);
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
    await page.goto("/wow-forever/vanguard");
    await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
    const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
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
    const claimPoint = await seatCanvasPoint(page, seatId);
    await page.mouse.click(claimPoint.x, claimPoint.y);
    await expect(page.getByRole("heading", { name: `Claim ${seatId}`, exact: true })).toBeVisible({
      timeout: 1500,
    });
    await page.getByLabel("Vanguard Name", { exact: true }).fill("Chosen Vanguard");
    await page.getByLabel("Faction", { exact: true }).selectOption("horde");
    await page.getByLabel("Class", { exact: true }).selectOption("Mage");
    await inscribe(page);
    await page.waitForTimeout(50);
    const after = await pixels();
    const meanDifference =
      after.reduce((sum, value, index) => sum + Math.abs(value - before[index]!), 0) / after.length;
    // One newly occupied place can change a few pixels; an 8x Seat focus changes the whole framing.
    expect(meanDifference).toBeLessThan(3);
  } finally {
    await cleanup();
  }
});

test("mouse wheel on Vanguard Canvas preserves default scrolling and does not zoom monument", async ({
  page,
}) => {
  await fixtures(page);
  await page.goto("/wow-forever/vanguard");
  await page.getByRole("button", { name: "ENTER THE MONUMENT", exact: true }).click();
  const canvas = page.getByLabel("Interactive Monument. Drag to pan or pinch to zoom.", {
    exact: true,
  });
  await expect
    .poll(() => canvas.evaluate((node) => Number(getComputedStyle(node).opacity)))
    .toBe(1);

  const dispatchedNotPrevented = await canvas.evaluate((node) =>
    node.dispatchEvent(new WheelEvent("wheel", { deltaY: 300, bubbles: true, cancelable: true })),
  );
  expect(dispatchedNotPrevented).toBe(true);

  async function pixels() {
    const url = await canvas.evaluate(
      (node) =>
        new Promise<string>((resolve) =>
          requestAnimationFrame(() => resolve((node as HTMLCanvasElement).toDataURL("image/png"))),
        ),
    );
    return sharp(Buffer.from(url.split(",")[1]!, "base64"))
      .resize(64, 64)
      .removeAlpha()
      .raw()
      .toBuffer();
  }

  const before = await pixels();
  const rect = await canvas.boundingBox();
  if (!rect) throw new Error("Canvas missing");

  await page.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
  await page.mouse.wheel(0, 300);
  await page.waitForTimeout(100);

  const after = await pixels();
  const meanDifference =
    after.reduce((sum, value, index) => sum + Math.abs(value - before[index]!), 0) / after.length;
  expect(meanDifference).toBe(0);

  const hasScrollableSpace = await page.evaluate(
    () => document.documentElement.scrollHeight > window.innerHeight,
  );
  if (hasScrollableSpace) {
    const scrollY = await page.evaluate(() => window.scrollY);
    expect(scrollY).toBeGreaterThan(0);
  }
});

test("Report retries and fast repeated clicks keep one operation; reopening starts another", async ({
  page,
}) => {
  await fixtures(page, { sealed: true, existing: true });
  const submissions: Array<{ operationId: string; reason: string }> = [];
  await page.route("**/api/vanguard/reports", (route) => {
    submissions.push(route.request().postDataJSON());
    return route.fulfill(
      submissions.length === 1
        ? { status: 503, json: { error: { code: "REPORT_NOTIFICATION_FAILED" } } }
        : { status: 201, json: { received: true } },
    );
  });
  await page.goto(`/wow-forever/vanguard?seat=${seatId}`);
  const focus = page.getByRole("region", { name: "Vanguard Focus", exact: true });
  const report = focus.getByText("Report", { exact: true });
  const submit = focus.getByRole("button", { name: "Submit Report" });
  await report.click();
  await submit.click();
  await expect(submit).toBeEnabled();
  await submit.click();
  await expect(page.getByText("Report received. Thank you.", { exact: true })).toBeVisible();
  await submit.click();
  await expect.poll(() => submissions.length).toBe(3);
  expect(new Set(submissions.map((value) => value.operationId)).size).toBe(1);
  expect(submissions[0]!.operationId).toMatch(/^[a-f0-9-]{36}$/);
  await report.click();
  await report.click();
  await submit.click();
  await expect.poll(() => submissions.length).toBe(4);
  expect(submissions[3]!.operationId).not.toBe(submissions[0]!.operationId);
});
