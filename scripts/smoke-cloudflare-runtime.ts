import { readFile, writeFile, unlink } from "node:fs/promises";
import { randomBytes, randomUUID } from "node:crypto";
import { resolve } from "node:path";
import postgres from "postgres";
import { spawn, type ChildProcess } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import { createDatabaseClient } from "@/platform/database/client";
import { assertSafeTestDatabaseUrl } from "../tests/support/test-database-guard";

const source = new URL(assertSafeTestDatabaseUrl());
if (!["localhost", "127.0.0.1", "[::1]"].includes(source.hostname))
  throw new Error("Cloudflare smoke requires an isolated loopback PostgreSQL server");
const databaseName = `vanguard_runtime_test_${randomUUID().replaceAll("-", "")}`;
const adminUrl = new URL(source);
adminUrl.pathname = "/postgres";
const admin = postgres(adminUrl.toString(), { max: 1 });
const databaseUrl = new URL(source);
databaseUrl.pathname = `/${databaseName}`;
const connection = createDatabaseClient(databaseUrl.toString());
const configPath = resolve("dist/server/wrangler.smoke.json");
const port = 3197;
const testAuthSecret = randomBytes(32).toString("hex");
const testGoogleSecret = randomBytes(32).toString("hex");
let child: ChildProcess | undefined;
let exited: Promise<void> | undefined;
let created = false;
try {
  await admin`create database ${admin(databaseName)}`;
  created = true;
  await migrate(connection.db, { migrationsFolder: "drizzle" });
  await connection.close();
  const config = JSON.parse(await readFile("dist/server/wrangler.json", "utf8"));
  // Use the final emitted entrypoint and assets; strip every production binding.
  await writeFile(
    configPath,
    JSON.stringify({
      main: config.main,
      assets: config.assets,
      compatibility_date: config.compatibility_date,
      compatibility_flags: config.compatibility_flags,
      rules: config.rules,
      no_bundle: config.no_bundle,
      name: "tierlistbase-runtime-smoke",
      triggers: {},
      vars: {
        APP_ENV: "test",
        CREAT_WEB_E2E_VANGUARD: "1",
        GA4_MEASUREMENT_ID: "G-RUNTIMETEST",
        CLARITY_PROJECT_ID: "runtime-test",
        GOOGLE_CLIENT_ID: "runtime-smoke-client",
        GOOGLE_CLIENT_SECRET: testGoogleSecret,
        EMAIL_TRANSPORT: "test",
        TEST_EMAIL_DIR: "/tmp/tierlistbase-runtime-smoke-emails",
        APP_ORIGIN: `http://127.0.0.1:${port}`,
        DATABASE_URL: databaseUrl.toString(),
        BETTER_AUTH_SECRET: testAuthSecret,
      },
    }),
  );
  const childEnv: NodeJS.ProcessEnv = {
    NODE_ENV: "production",
    WRANGLER_SEND_METRICS: "false",
    CI: "true",
  };
  for (const key of ["PATH", "HOME", "TMPDIR", "SystemRoot"])
    if (process.env[key]) childEnv[key] = process.env[key]!;
  child = spawn(
    "bun",
    [
      "x",
      "--no-install",
      "wrangler",
      "dev",
      "--local",
      "--config",
      configPath,
      "--port",
      String(port),
      "--ip",
      "127.0.0.1",
    ],
    { env: childEnv, stdio: ["ignore", "pipe", "pipe"] },
  );
  let diagnostics = "";
  for (const stream of [child.stdout, child.stderr])
    stream?.on("data", (chunk) => {
      diagnostics = (diagnostics + String(chunk)).slice(-8000);
    });
  const startupError = () =>
    new Error(
      "Final Cloudflare artifact startup failed: " +
        diagnostics
          .replaceAll(testAuthSecret, "[redacted]")
          .replaceAll(testGoogleSecret, "[redacted]")
          .replace(/(?:postgres(?:ql)?|https?):\/\/[^\s\"<>]+/g, "[redacted-url]"),
    );
  exited = new Promise<void>((resolve, reject) => {
    child!.once("exit", () => resolve());
    child!.once("error", reject);
  });
  let started = false;
  for (let attempt = 0; attempt < 120; attempt++) {
    if (child.exitCode !== null) throw startupError();
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health/live`);
      if (response.status === 200) {
        started = true;
        break;
      }
    } catch {
      /* bounded startup polling */
    }
    await delay(500);
  }
  if (!started) throw startupError();
  for (const path of ["/api/health/live", "/api/health/ready", "/", "/api/vanguard/manifest"]) {
    const response = await fetch(`http://127.0.0.1:${port}${path}`, {
      signal: AbortSignal.timeout(15000),
      redirect: "manual",
    });
    if (response.status !== 200)
      throw new Error(
        `Cloudflare runtime smoke ${path}: expected 200, received ${response.status}; ${await response.text()}; ${diagnostics
          .replaceAll(testAuthSecret, "[redacted]")
          .replaceAll(testGoogleSecret, "[redacted]")
          .replace(/(?:postgres(?:ql)?|https?):\/\/[^\s\"<>]+/g, "[redacted-url]")}`,
      );
    const text = await response.text();
    if (path === "/") {
      if (!text.includes("TierListBase") || !text.includes("<html"))
        throw new Error("Cloudflare homepage HTML missing");
    } else {
      const value = JSON.parse(text);
      if (path.endsWith("/live") && value.status !== "ok")
        throw new Error("Invalid liveness response");
      if (path.endsWith("/ready") && value.status !== "ready")
        throw new Error("Invalid readiness response");
      if (path.endsWith("/manifest") && typeof value.version !== "string")
        throw new Error("Invalid Vanguard manifest response");
    }
    console.log(
      JSON.stringify({ event: "cloudflare_runtime_smoke", path, status: response.status }),
    );
  }
  child.kill();
  await exited;
} finally {
  if (child && child.exitCode === null) {
    child.kill();
    await exited;
  }
  await connection.close();
  await unlink(configPath).catch((error) => {
    if (error.code !== "ENOENT") throw error;
  });
  if (created) await admin`drop database ${admin(databaseName)} with (force)`;
  await admin.end();
}
