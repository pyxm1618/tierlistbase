import { expect, test } from "@playwright/test";

const analyticsHosts = [
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "region1.google-analytics.com",
  "www.clarity.ms",
];

function isAnalytics(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return analyticsHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function getMockCmpInitScript(
  options: {
    initialStatus?: "tcloaded" | "cmpuishown";
    analyticsGranted?: boolean;
    advertisingGranted?: boolean;
  } = {},
) {
  const initialStatus = options.initialStatus ?? "cmpuishown";
  const an = Boolean(options.analyticsGranted);
  const ad = Boolean(options.advertisingGranted);

  return `(() => {
    let currentEventStatus = "${initialStatus}";
    let consents = {
      1: ${an || ad},
      8: ${an},
      2: ${ad}
    };
    const listeners = [];

    const persisted = sessionStorage.getItem("mock_cmp_tcdata");
    if (persisted) {
      try {
        const parsed = JSON.parse(persisted);
        currentEventStatus = parsed.eventStatus;
        consents = parsed.purpose.consents;
      } catch (e) {}
    }

    window.__mockCmp = {
      reopenCalls: 0,
      setConsent: function(analytics, advertising) {
        currentEventStatus = "useractioncomplete";
        consents[1] = Boolean(analytics || advertising);
        consents[8] = Boolean(analytics);
        consents[2] = Boolean(advertising);
        sessionStorage.setItem("mock_cmp_tcdata", JSON.stringify({
          eventStatus: "tcloaded",
          purpose: { consents: consents }
        }));
        listeners.forEach(function(cb) {
          cb({
            eventStatus: currentEventStatus,
            purpose: { consents: consents }
          }, true);
        });
      }
    };

    window.__tcfapi = function(command, version, callback) {
      if (command === "addEventListener") {
        listeners.push(callback);
        setTimeout(function() {
          callback({
            eventStatus: currentEventStatus,
            purpose: { consents: consents }
          }, true);
        }, 10);
      }
    };

    window.googlefc = {
      callbackQueue: [],
      showRevocationMessage: function() {
        window.__mockCmp.reopenCalls++;
      }
    };
  })();`;
}

test("1. zero third-party requests before consent and floating settings button is removed", async ({
  page,
}) => {
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  // Load without any consent decision made (fail-closed)
  await page.addInitScript(getMockCmpInitScript({ initialStatus: "cmpuishown" }));
  await page.goto("/");
  await page.waitForTimeout(400);

  // 1. GA4 / Clarity zero requests before consent
  expect(requests).toEqual([]);

  // 2. Old permanent floating "Privacy settings" button is completely removed
  await expect(page.getByRole("button", { name: "Analytics settings" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Privacy settings", exact: true })).toHaveCount(0);
  await expect(page.locator(".fixed.bottom-4.left-4")).toHaveCount(0);

  // 3. Footer has standard Privacy & cookie settings entry
  const footerButton = page.getByRole("button", { name: "Privacy & cookie settings" });
  await expect(footerButton).toBeVisible();
});

test("2. reject non-essential keeps analytics disabled", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (isAnalytics(request.url())) requests.push(request.url());
  });

  await page.addInitScript(getMockCmpInitScript({ initialStatus: "cmpuishown" }));
  await page.goto("/");

  // Simulate user rejecting non-essential in CMP
  await page.evaluate("window.__mockCmp.setConsent(false, false)");
  await page.waitForTimeout(300);

  expect(requests).toEqual([]);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);
});

test("3. analytics consent granted allows GA4 and Clarity to load", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.addInitScript(getMockCmpInitScript({ initialStatus: "cmpuishown" }));
  await page.goto("/");
  await page.waitForTimeout(200);
  expect(requests).toEqual([]);

  // User grants Analytics consent
  await page.evaluate("window.__mockCmp.setConsent(true, false)");

  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(1);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(1);
});

test("4. consent state correctly restores across reload", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  // Pre-seed CMP state as granted (tcloaded)
  await page.addInitScript(
    getMockCmpInitScript({ initialStatus: "tcloaded", analyticsGranted: true }),
  );
  await page.goto("/");
  await expect.poll(() => requests.length).toBeGreaterThan(0);

  // Reload page and ensure consent restores without prompting
  requests.length = 0;
  await page.reload();
  await expect.poll(() => requests.length).toBeGreaterThan(0);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(1);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(1);
});

test("5. footer reopens preferences and withdrawal stops analytics", async ({ page }) => {
  const requests: string[] = [];
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    await route.continue();
  });

  await page.addInitScript(
    getMockCmpInitScript({ initialStatus: "tcloaded", analyticsGranted: true }),
  );
  await page.goto("/");
  await expect.poll(() => requests.length).toBeGreaterThan(0);

  // 1. Reopen via Footer button
  const footerButton = page.getByRole("button", { name: "Privacy & cookie settings" });
  await expect(footerButton).toBeVisible();
  await footerButton.click();

  const reopenCalls = await page.evaluate("window.__mockCmp.reopenCalls");
  expect(reopenCalls).toBe(1);

  // 2. User changes preference and withdraws Analytics consent
  await page.evaluate("window.__mockCmp.setConsent(false, false)");

  // 3. Analytics scripts removed immediately
  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);

  // 4. Reload retains withdrawn state
  requests.length = 0;
  await page.reload();
  await page.waitForTimeout(300);
  expect(requests).toEqual([]);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);
});

test("6. sensitive sign-in surface does not load analytics even with consent", async ({ page }) => {
  const requests: string[] = [];
  page.on("request", (request) => {
    if (isAnalytics(request.url())) requests.push(request.url());
  });

  await page.addInitScript(
    getMockCmpInitScript({ initialStatus: "tcloaded", analyticsGranted: true }),
  );
  await page.goto("/sign-in");
  await page.waitForTimeout(300);
  expect(requests).toEqual([]);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);
});
