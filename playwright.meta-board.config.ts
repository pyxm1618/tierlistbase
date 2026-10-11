import { defineConfig } from "@playwright/test";

import performanceConfig from "./playwright.performance.config";

export default defineConfig({
  ...performanceConfig,
  testDir: "./tests/meta-board",
  workers: 1,
});
