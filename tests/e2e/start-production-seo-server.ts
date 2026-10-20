import { spawn, type ChildProcess } from "node:child_process";
import { randomBytes } from "node:crypto";

function waitForExit(child: ChildProcess): Promise<number> {
  return new Promise((resolve, reject) => {
    child.once("error", reject);
    child.once("exit", (code) => resolve(code ?? 1));
  });
}

const inheritedEnv: NodeJS.ProcessEnv = { ...process.env };
delete inheritedEnv.TEST_EMAIL_DIR;
delete inheritedEnv.CREAT_WEB_E2E_ENABLED_FEATURES;

const env: NodeJS.ProcessEnv = {
  ...inheritedEnv,
  // Ephemeral values let this local SEO harness exercise production validation.
  // No real provider is contacted or accepted by this browser suite.
  BETTER_AUTH_SECRET: randomBytes(32).toString("hex"),
  CRON_SECRET: randomBytes(32).toString("hex"),
  GOOGLE_CLIENT_ID: "seo-browser-fixture.apps.googleusercontent.com",
  GOOGLE_CLIENT_SECRET: randomBytes(32).toString("hex"),
  EMAIL_TRANSPORT: "resend",
  RESEND_API_KEY: `re_${randomBytes(24).toString("hex")}`,
  EMAIL_FROM: "SEO Browser Fixture <noreply@example.test>",
  SUPPORT_EMAIL: "support@example.test",
  APP_ENV: "production",
  APP_ORIGIN: "https://example.com",
  DATABASE_URL: process.env.DATABASE_URL ?? "postgres://test:test@127.0.0.1:5432/test",
};

const build = spawn("bun", ["run", "build"], { stdio: "inherit", env });
const buildExitCode = await waitForExit(build);
if (buildExitCode !== 0) process.exit(buildExitCode);

const server = spawn("bun", ["run", "start", "--", "-p", "3100"], {
  stdio: "inherit",
  env,
});
for (const signal of ["SIGINT", "SIGTERM"] as const) {
  process.on(signal, () => server.kill(signal));
}
process.exitCode = await waitForExit(server);
