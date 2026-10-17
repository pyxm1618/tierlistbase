import { expect, test } from "@playwright/test";

const analyticsHosts = [
  "www.googletagmanager.com",
  "www.google-analytics.com",
  "region1.google-analytics.com",
  "www.clarity.ms",
  "scripts.clarity.ms",
];

function isAnalytics(url: string): boolean {
  try {
    const hostname = new URL(url).hostname;
    return analyticsHosts.some((host) => hostname === host || hostname.endsWith(`.${host}`));
  } catch {
    return false;
  }
}

function isCmpExternal(url: string): boolean {
  return (
    url.includes("pagead2.googlesyndication.com") ||
    url.includes("fundingchoicesmessages.google.com") ||
    url.includes("googleads.g.doubleclick.net")
  );
}

function getMockCmpInitScript(
  options: {
    initialAnalyticsStorage?: "granted" | "denied";
    initialAdStorage?: "granted" | "denied";
  } = {},
) {
  const initialAnalyticsStorage = options.initialAnalyticsStorage ?? "denied";
  const initialAdStorage = options.initialAdStorage ?? "denied";

  return `(() => {
    let consentValues = {
      analytics_storage: "${initialAnalyticsStorage}",
      ad_storage: "${initialAdStorage}"
    };

    const persisted = sessionStorage.getItem("mock_googlefc_consent_mode");
    if (persisted) {
      try {
        consentValues = JSON.parse(persisted);
      } catch (e) {}
    }

    const callbacks = [];

    window.__mockCmp = {
      reopenCalls: 0,
      setConsent: function(analyticsStorage, adStorage) {
        consentValues = {
          analytics_storage: analyticsStorage ? "granted" : "denied",
          ad_storage: adStorage ? "granted" : "denied"
        };
        sessionStorage.setItem("mock_googlefc_consent_mode", JSON.stringify(consentValues));
        callbacks.forEach(function(item) {
          if (typeof item === "function") {
            try { item(); } catch (e) {}
          } else if (item && typeof item.CONSENT_MODE_DATA_READY === "function") {
            try { item.CONSENT_MODE_DATA_READY(); } catch (e) {}
          }
        });
      }
    };

    const queue = [];
    const proxyQueue = new Proxy(queue, {
      set: function(target, prop, value) {
        target[prop] = value;
        if (typeof value === "function" || (value && typeof value.CONSENT_MODE_DATA_READY === "function")) {
          callbacks.push(value);
        }
        return true;
      }
    });

    window.googlefc = {
      callbackQueue: proxyQueue,
      getGoogleConsentModeValues: function() {
        return consentValues;
      },
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
    if (isCmpExternal(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "// mock cmp",
      });
      return;
    }
    await route.continue();
  });

  // Load without any consent decision made (fail-closed)
  await page.addInitScript(getMockCmpInitScript({ initialAnalyticsStorage: "denied" }));
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
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    if (isCmpExternal(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "// mock cmp",
      });
      return;
    }
    await route.continue();
  });

  await page.addInitScript(getMockCmpInitScript({ initialAnalyticsStorage: "denied" }));
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
    if (isCmpExternal(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "// mock cmp",
      });
      return;
    }
    await route.continue();
  });

  await page.addInitScript(getMockCmpInitScript({ initialAnalyticsStorage: "denied" }));
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
    if (isCmpExternal(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "// mock cmp",
      });
      return;
    }
    await route.continue();
  });

  // Pre-seed CMP state as granted
  await page.addInitScript(
    getMockCmpInitScript({ initialAnalyticsStorage: "granted", initialAdStorage: "denied" }),
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
    if (isCmpExternal(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "// mock cmp",
      });
      return;
    }
    await route.continue();
  });

  await page.addInitScript(
    getMockCmpInitScript({ initialAnalyticsStorage: "granted", initialAdStorage: "denied" }),
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
  await page.route("**/*", async (route) => {
    const url = route.request().url();
    if (isAnalytics(url)) {
      requests.push(url);
      await route.abort();
      return;
    }
    if (isCmpExternal(url)) {
      await route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "// mock cmp",
      });
      return;
    }
    await route.continue();
  });

  await page.addInitScript(
    getMockCmpInitScript({ initialAnalyticsStorage: "granted", initialAdStorage: "denied" }),
  );
  await page.goto("/sign-in");
  await page.waitForTimeout(300);
  expect(requests).toEqual([]);
  await expect(page.locator("#creat-web-ga4")).toHaveCount(0);
  await expect(page.locator("#creat-web-clarity")).toHaveCount(0);
});
