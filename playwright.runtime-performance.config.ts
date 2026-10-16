import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/runtime-performance",
  workers: 1,
  retries: 0,
  timeout: 60_000,
  use: {
    // External URLs never start a server or seed a database.
    baseURL: process.env.PERFORMANCE_BASE_URL ?? "http://localhost:8787",
    trace: "retain-on-failure",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
});
