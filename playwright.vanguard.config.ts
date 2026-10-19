import { randomBytes } from "node:crypto";
import { defineConfig, devices } from "@playwright/test";
const authFixtureToken = process.env.VANGUARD_E2E_AUTH_TOKEN ?? randomBytes(32).toString("hex");
process.env.VANGUARD_E2E_AUTH_TOKEN = authFixtureToken;
export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: /vanguard-(foundation|flows|business)\.spec\.ts/,
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:3197",
    ...devices["Desktop Chrome"],
    ...(process.env.CI ? {} : { channel: "chrome" }),
    launchOptions: {
      args: ["--use-fake-ui-for-media-stream", "--use-fake-device-for-media-stream"],
    },
    trace: "retain-on-failure",
  },
  webServer: {
    command: "bun tests/e2e/start-vanguard-test-server.ts",
    url: "http://127.0.0.1:3197",
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      APP_ENV: "test",
      APP_ORIGIN: "http://127.0.0.1:3197",
      PORT: "3197",
      DATABASE_URL: process.env.TEST_DATABASE_URL ?? "postgres://localhost/vanguard_20261019_test",
      CREAT_WEB_E2E_VANGUARD: "1",
      VANGUARD_E2E_LAYOUT_ORIGIN: "http://127.0.0.1:3199",
      TEST_EMAIL_DIR: "/tmp/tierlistbase-vanguard-e2e-emails",
      BETTER_AUTH_SECRET: authFixtureToken,
      GOOGLE_CLIENT_ID: "vanguard-ui-fixture-google-client",
      GOOGLE_CLIENT_SECRET: randomBytes(32).toString("hex"),
      EMAIL_TRANSPORT: "test",
      GA4_MEASUREMENT_ID: "G-E2E0000001",
      CLARITY_PROJECT_ID: "e2eclarity",
    },
  },
});
