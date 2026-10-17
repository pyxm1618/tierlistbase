import { expect, test } from "@playwright/test";

const genshin = "/genshin-impact/tier-list";
const wow = "/wow-forever/tier-list";

test("public RSC prefetches retain foreground network priority", async ({ page, isMobile }) => {
  // A Low fetch can remain queued behind avatar downloads after navigation consumes it.
  const session = await page.context().newCDPSession(page);
  const requests: { path: string; priority: string }[] = [];
  await session.send("Network.enable");
  session.on("Network.requestWillBeSent", (event) => {
    const url = new URL(event.request.url);
    if (url.searchParams.has("_rsc") && ["/", genshin, wow].includes(url.pathname)) {
      requests.push({ path: url.pathname, priority: event.request.initialPriority });
    }
  });
  for (const source of ["/", genshin]) {
    await page.goto(source, { waitUntil: "domcontentloaded" });
    if (isMobile) await page.locator("header summary").click();
    await expect
      .poll(() => requests.map((request) => request.path))
      .toEqual(expect.arrayContaining(source === "/" ? [genshin, wow] : ["/"]));
  }
  expect(requests.filter((request) => request.priority !== "High")).toEqual([]);
});

test("completed Home card prefetches are reused by Header navigation", async ({
  page,
  isMobile,
}) => {
  for (const target of [genshin, wow]) {
    await page.goto("/", { waitUntil: "load" });
    await page.locator(`a.tlb-game-card[href="${target}"]`).scrollIntoViewIfNeeded();
    await expect
      .poll(() =>
        page.evaluate((target) => {
          const cache = Reflect.get(window, "__VINEXT_RSC_PREFETCH_CACHE__") as
            | Map<string, { snapshot?: unknown; preparedElements?: unknown; prefetchKind?: string }>
            | undefined;
          return [...(cache?.entries() ?? [])].some(
            ([key, entry]) =>
              new URL(key.split("\0")[0] ?? key, location.href).pathname === target &&
              entry.prefetchKind === "navigation" &&
              !!entry.snapshot &&
              !!entry.preparedElements,
          );
        }, target),
      )
      .toBe(true);
    const duplicateRequests: string[] = [];
    const recordRequest = (request: import("@playwright/test").Request) => {
      const url = new URL(request.url());
      if (url.pathname === target && url.searchParams.has("_rsc")) {
        duplicateRequests.push(request.url());
      }
    };
    page.on("request", recordRequest);
    if (isMobile) await page.locator("header summary").click();
    await page.locator(`header a[href="${target}"]`).filter({ visible: true }).first().click();
    await expect(
      page
        .locator(target === genshin ? 'input[aria-label="Search characters"]' : "[data-spec-id]")
        .first(),
    ).toBeVisible();
    page.off("request", recordRequest);
    expect(duplicateRequests, "completed prefetch must supply the destination payload").toEqual([]);
  }
});

for (const path of ["/", genshin, wow]) {
  test(`${path} serves the LCP WebP without an optimizer redirect`, async ({ page, request }) => {
    await page.goto(path, { waitUntil: "load" });
    const hero = page.locator(
      path === "/"
        ? ".tlb-hero-cover"
        : path === genshin
          ? '[data-ia-section="page-header"] img'
          : "[data-wow-hero] img",
    );
    const src = await hero.evaluate((element) => (element as HTMLImageElement).currentSrc);
    expect(src).not.toContain("/_next/image?");
    const response = await request.get(src, { maxRedirects: 0 });
    expect(response.status()).toBe(200);
    expect(response.headers()["content-type"]).toContain("image/webp");
    await expect(hero).toHaveAttribute("loading", "eager");
    await expect(hero).toHaveAttribute("fetchpriority", "high");
    if (path === "/") {
      const cards = page.locator(".tlb-card-image img");
      expect(await cards.count()).toBe(2);
      for (const card of await cards.all()) {
        await expect(card).toHaveAttribute("loading", "lazy");
        await expect(card).not.toHaveAttribute("fetchpriority", "high");
        const cardSrc = await card.evaluate((el) => (el as HTMLImageElement).currentSrc);
        expect(cardSrc).not.toContain("/_next/image?");
      }
    }
  });

  if (path !== "/") {
    test(`${path} returns warm HTML within the 500ms response budget`, async ({ request }) => {
      const first = await request.get(path);
      expect(first.status()).toBe(200);
      const start = performance.now();
      const second = await request.get(path);
      const warmHtmlResponseMs = performance.now() - start;
      expect(second.status()).toBe(200);
      expect(await second.text()).toContain(
        path === genshin ? "Genshin Character Tier List" : "All Specs",
      );
      expect(warmHtmlResponseMs).toBeLessThan(500);
    });
  }
}

test("WoW cached reads keep DPS and Tank contexts separate", async ({ page }) => {
  for (const role of ["tank", "dps"]) {
    await page.goto(`${wow}?role=${role}`, { waitUntil: "load" });
    await expect(page.locator('nav[aria-label="Ranking Role"] a[aria-current="page"]')).toHaveText(
      role.toUpperCase(),
    );
    const cards = page.locator("[data-spec-id]");
    expect(await cards.count()).toBeGreaterThan(0);
    for (const label of await cards.evaluateAll((items) =>
      items.map((item) => item.getAttribute("aria-label")),
    )) {
      expect(label).toContain(`, ${role.toUpperCase()},`);
    }
  }
});

for (const [from, to] of [
  ["/", genshin],
  ["/", wow],
  [genshin, "/"],
  [wow, "/"],
  [genshin, wow],
] as const) {
  test(`${from} → ${to} paints pending or destination feedback within 100ms`, async ({
    page,
    isMobile,
  }) => {
    // Fault injection protects pending feedback, not a claimed production latency.
    let navigationStarted = false;
    await page.route("**/*_rsc=*", async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      // Delay the destination payload only; subsequent background prefetches are aborted.
      if (
        !navigationStarted ||
        url.pathname !== to ||
        [...url.searchParams.keys()].some((key) => key !== "_rsc") ||
        request.headers()["x-vinext-rsc-render-mode"] === "prefetch-loading-shell"
      ) {
        return route.abort();
      }
      const response = await route.fetch();
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await route.fulfill({ response });
    });
    await page.goto(from, { waitUntil: "networkidle" });
    if (isMobile && to !== "/") await page.locator("header summary").click();
    const link = page.locator(`header a[href="${to}"]`).filter({ visible: true }).first();
    await link.evaluate((element) => {
      element.addEventListener(
        "click",
        () => {
          const start = performance.now();
          const previousContent = document.querySelector("main")?.textContent;
          const observer = new MutationObserver(() => {
            if (!element.querySelector('[data-navigation-pending="true"]')) return;
            observer.disconnect();
            requestAnimationFrame(() => {
              element.setAttribute("data-feedback-ms", String(performance.now() - start));
              element.setAttribute("data-feedback-opacity", getComputedStyle(element).opacity);
              element.setAttribute(
                "data-destination-painted",
                String(
                  location.pathname === new URL((element as HTMLAnchorElement).href).pathname &&
                    document.querySelector("main")?.textContent !== previousContent,
                ),
              );
            });
          });
          observer.observe(element, { subtree: true, attributes: true });
        },
        { once: true, capture: true },
      );
    });
    navigationStarted = true;
    await link.click();
    await expect(link).toHaveAttribute("data-feedback-ms", /\d/);
    expect(Number(await link.getAttribute("data-feedback-ms"))).toBeLessThan(100);
    expect(
      Number(await link.getAttribute("data-feedback-opacity")) < 1 ||
        (await link.getAttribute("data-destination-painted")) === "true",
    ).toBe(true);
    await page.waitForURL((url) => url.pathname === to);
    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator('header [data-navigation-pending="true"]')).toHaveCount(0);
    navigationStarted = false;
    await page.unrouteAll({ behavior: "wait" });
  });
}
