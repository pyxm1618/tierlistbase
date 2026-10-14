import { execSync, spawn, type ChildProcess } from "node:child_process";
import { chromium, type Browser } from "@playwright/test";

type NavRoute = {
  name: string;
  fromUrl: string;
  toUrl: string;
  linkSelector: string;
  readySelector: string;
};

const ROUTES: NavRoute[] = [
  {
    name: "Home -> WoW",
    fromUrl: "http://127.0.0.1:3100/",
    toUrl: "http://127.0.0.1:3100/wow-forever/tier-list",
    linkSelector: 'header nav[aria-label="Primary navigation"] a[href="/wow-forever/tier-list"]',
    readySelector: 'section[aria-label="Tier Board"]',
  },
  {
    name: "Home -> Genshin",
    fromUrl: "http://127.0.0.1:3100/",
    toUrl: "http://127.0.0.1:3100/genshin-impact/tier-list",
    linkSelector: 'header nav[aria-label="Primary navigation"] a[href="/genshin-impact/tier-list"]',
    readySelector: 'section[aria-label="Genshin Impact Tier List"]',
  },
  {
    name: "WoW -> Genshin",
    fromUrl: "http://127.0.0.1:3100/wow-forever/tier-list",
    toUrl: "http://127.0.0.1:3100/genshin-impact/tier-list",
    linkSelector: 'header nav[aria-label="Primary navigation"] a[href="/genshin-impact/tier-list"]',
    readySelector: 'section[aria-label="Genshin Impact Tier List"]',
  },
  {
    name: "Genshin -> WoW",
    fromUrl: "http://127.0.0.1:3100/genshin-impact/tier-list",
    toUrl: "http://127.0.0.1:3100/wow-forever/tier-list",
    linkSelector: 'header nav[aria-label="Primary navigation"] a[href="/wow-forever/tier-list"]',
    readySelector: 'section[aria-label="Tier Board"]',
  },
];

type TimingResult = {
  totalMs: number;
  urlMs: number;
};

type Stats = {
  min: number;
  max: number;
  p50: number;
  p95: number;
  avg: number;
};

function calculateStats(samples: number[]): Stats {
  if (samples.length === 0) return { min: 0, max: 0, p50: 0, p95: 0, avg: 0 };
  const sorted = [...samples].sort((a, b) => a - b);
  const min = sorted[0]!;
  const max = sorted[sorted.length - 1]!;
  const p50 = sorted[Math.floor(sorted.length * 0.5)]!;
  const p95 = sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * 0.95))]!;
  const avg = sorted.reduce((sum, v) => sum + v, 0) / sorted.length;
  return { min, max, p50, p95, avg };
}

async function waitForServerReady(url: string, timeoutMs = 10000): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.status === 200) return;
    } catch {
      // Retry
    }
    await new Promise((r) => setTimeout(r, 100));
  }
  throw new Error(`Server failed to become ready at ${url}`);
}

async function runSample(
  browser: Browser,
  route: NavRoute,
  mode: "warm" | "cold",
): Promise<TimingResult> {
  const page = await browser.newPage({
    viewport: { width: 1280, height: 800 },
  });

  if (mode === "cold") {
    await page.route("**/*", (r) => {
      const headers = r.request().headers();
      const isPrefetch =
        headers["next-router-prefetch"] === "1" ||
        headers["purpose"] === "prefetch" ||
        headers["sec-purpose"] === "prefetch";
      if (isPrefetch) {
        return r.fulfill({ status: 204, body: "" });
      }
      return r.continue();
    });
  }

  await page.goto(route.fromUrl, { waitUntil: "domcontentloaded" });

  const link = page.locator(route.linkSelector);
  await link.waitFor({ state: "visible" });

  if (mode === "warm") {
    // Wait briefly for Next.js to trigger and receive prefetch
    await page.waitForTimeout(150);
  }

  const clickStart = performance.now();
  await link.click();

  await page.waitForURL((url) => url.pathname === new URL(route.toUrl).pathname, {
    timeout: 8000,
  });
  const urlChanged = performance.now();

  const readyElement = page.locator(route.readySelector);
  await readyElement.waitFor({ state: "visible", timeout: 8000 });
  const contentReady = performance.now();

  await page.close();

  return {
    totalMs: contentReady - clickStart,
    urlMs: urlChanged - clickStart,
  };
}

async function main() {
  try {
    execSync("lsof -ti :3100 | xargs kill -9 2>/dev/null || true");
    await new Promise((r) => setTimeout(r, 200));
  } catch {
    // ignore
  }

  console.log("Starting Next.js production server (bun run start) on port 3100...");
  const serverProcess: ChildProcess = spawn("bun", ["run", "start", "--", "-p", "3100"], {
    stdio: "inherit",
    env: { ...process.env, PORT: "3100", APP_ORIGIN: "http://127.0.0.1:3100" },
  });

  let serverCleanedUp = false;
  const cleanup = () => {
    if (!serverCleanedUp) {
      serverCleanedUp = true;
      try {
        serverProcess.kill("SIGTERM");
      } catch {
        // ignore
      }
    }
  };

  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  try {
    await waitForServerReady("http://127.0.0.1:3100/");
    console.log("Next.js production server is ready at http://127.0.0.1:3100/\n");

    const browser = await chromium.launch({ headless: true });

    const results: Record<
      string,
      {
        cold: { total: number[]; url: number[] };
        warm: { total: number[]; url: number[] };
      }
    > = {};

    const SAMPLES = Number(process.env.SAMPLES ?? 30);
    const ONLY_WARM = process.env.ONLY_WARM === "1";

    for (const route of ROUTES) {
      results[route.name] = {
        cold: { total: [], url: [] },
        warm: { total: [], url: [] },
      };

      console.log(`========================================`);
      console.log(`Testing Route: ${route.name}`);
      console.log(`========================================`);

      // 1. Cold Navigation (if not ONLY_WARM)
      if (!ONLY_WARM) {
        console.log(`--- Cold Navigation (${SAMPLES} samples) ---`);
        for (let i = 0; i < SAMPLES; i++) {
          const timing = await runSample(browser, route, "cold");
          results[route.name]!.cold.total.push(timing.totalMs);
          results[route.name]!.cold.url.push(timing.urlMs);
          process.stdout.write(
            `#${i + 1}:${timing.totalMs.toFixed(0)}ms(url:${timing.urlMs.toFixed(0)}ms) `,
          );
        }
        console.log();
      }

      // 2. Warm Navigation
      console.log(`--- Warm Navigation (${SAMPLES} samples) ---`);
      for (let i = 0; i < SAMPLES; i++) {
        const timing = await runSample(browser, route, "warm");
        results[route.name]!.warm.total.push(timing.totalMs);
        results[route.name]!.warm.url.push(timing.urlMs);
        process.stdout.write(
          `#${i + 1}:${timing.totalMs.toFixed(0)}ms(url:${timing.urlMs.toFixed(0)}ms) `,
        );
      }
      console.log("\n");
    }

    // Mobile functional verification
    console.log("=========================================");
    console.log("Verifying Mobile Menu Functional Integrity");
    console.log("=========================================");
    const mobileContext = await browser.newContext({
      viewport: { width: 390, height: 844 },
      isMobile: true,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto("http://127.0.0.1:3100/", { waitUntil: "domcontentloaded" });
    const menuSummary = mobilePage.locator("header details summary");
    await menuSummary.click();
    const wowMobileLink = mobilePage.locator(
      'header nav[aria-label="Mobile navigation"] a[href="/wow-forever/tier-list"]',
    );
    await wowMobileLink.click();
    await mobilePage.waitForURL("**/wow-forever/tier-list");
    await mobilePage.locator('section[aria-label="Tier Board"]').waitFor({ state: "visible" });
    console.log("Mobile navigation to /wow-forever/tier-list verified successfully!");
    await mobileContext.close();

    await browser.close();

    // Print Final Baseline Summary Table
    console.log("\n\n==================== BASELINE SUMMARY ====================");
    for (const route of ROUTES) {
      const coldStats = calculateStats(results[route.name]!.cold.total);
      const warmStats = calculateStats(results[route.name]!.warm.total);
      console.log(`\n[${route.name}]`);
      console.log(
        `  COLD: P50=${coldStats.p50.toFixed(1)}ms | P95=${coldStats.p95.toFixed(1)}ms | Min=${coldStats.min.toFixed(1)}ms | Max=${coldStats.max.toFixed(1)}ms | Avg=${coldStats.avg.toFixed(1)}ms`,
      );
      console.log(
        `  WARM: P50=${warmStats.p50.toFixed(1)}ms | P95=${warmStats.p95.toFixed(1)}ms | Min=${warmStats.min.toFixed(1)}ms | Max=${warmStats.max.toFixed(1)}ms | Avg=${warmStats.avg.toFixed(1)}ms`,
      );
    }
  } finally {
    cleanup();
  }
}

main().catch((err) => {
  console.error("Measurement script error:", err);
  process.exit(1);
});
