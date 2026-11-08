import { execFileSync } from "node:child_process";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const INDEXNOW_ENDPOINT = "https://www.tierlistbase.com/api/internal/seo/indexnow";
const RELEASE_MANIFEST_PATTERN = /^\.github\/indexnow\/releases\/[^/]+\.txt$/;

export type IndexNowProductionDependencies = {
  listChangedFiles: (base: string, head: string) => Promise<string[]>;
  readManifest: (path: string) => Promise<string>;
  submit: (urls: readonly string[], cronSecret: string) => Promise<number>;
};

export type IndexNowProductionResult =
  | { kind: "skipped"; reason: "no-manifest" | "empty-manifest"; urls: [] }
  | { kind: "submitted"; urls: string[]; httpStatus: number }
  | { kind: "failed"; urls: string[]; error: string };

function messageOf(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function manifestUrls(contents: string): string[] {
  return contents
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0 && !line.startsWith("#"));
}

export const productionIndexNowDependencies: IndexNowProductionDependencies = {
  async listChangedFiles(base, head) {
    const stdout = execFileSync(
      "git",
      ["diff", "--diff-filter=AM", "--name-only", base, head],
      { encoding: "utf8" },
    );
    return stdout
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter(Boolean);
  },
  async readManifest(path) {
    return readFile(path, "utf8");
  },
  async submit(urls, cronSecret) {
    const response = await fetch(INDEXNOW_ENDPOINT, {
      method: "POST",
      headers: {
        authorization: `Bearer ${cronSecret}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({ urls }),
    });
    return response.status;
  },
};

export async function runIndexNowProductionWiring(
  input: { base: string; head: string; cronSecret?: string },
  dependencies: IndexNowProductionDependencies = productionIndexNowDependencies,
): Promise<IndexNowProductionResult> {
  try {
    const changedFiles = await dependencies.listChangedFiles(input.base, input.head);
    const manifests = changedFiles.filter((path) => RELEASE_MANIFEST_PATTERN.test(path));

    // MUTATION PROBE: deliberately wrong fallback. The semantic tests must reject this.
    if (manifests.length === 0) {
      const urls = ["https://www.tierlistbase.com/sitemap.xml"];
      const httpStatus = await dependencies.submit(urls, input.cronSecret ?? "");
      return { kind: "submitted", urls, httpStatus };
    }

    const urls: string[] = [];
    for (const manifest of manifests) {
      urls.push(...manifestUrls(await dependencies.readManifest(manifest)));
    }

    if (urls.length === 0) {
      return { kind: "skipped", reason: "empty-manifest", urls: [] };
    }

    const cronSecret = input.cronSecret?.trim();
    if (!cronSecret) {
      return {
        kind: "failed",
        urls,
        error:
          "IndexNow post-deploy submission cannot authenticate because CRON_SECRET is not configured.",
      };
    }

    const httpStatus = await dependencies.submit(urls, cronSecret);
    if (httpStatus !== 200 && httpStatus !== 202) {
      return {
        kind: "failed",
        urls,
        error: `IndexNow post-deploy submission failed with HTTP ${httpStatus}.`,
      };
    }

    return { kind: "submitted", urls, httpStatus };
  } catch (error) {
    return { kind: "failed", urls: [], error: messageOf(error) };
  }
}

async function main(): Promise<void> {
  const head = process.env.GITHUB_SHA?.trim();
  if (!head) {
    console.error(
      "::error::IndexNow post-deploy submission cannot run because GITHUB_SHA is missing.",
    );
    return;
  }

  const pushBase = process.env.PUSH_BASE_SHA?.trim();
  const base =
    !pushBase || pushBase === "0000000000000000000000000000000000000000"
      ? `${head}^`
      : pushBase;

  const result = await runIndexNowProductionWiring({
    base,
    head,
    cronSecret: process.env.CRON_SECRET,
  });

  if (result.kind === "skipped") {
    console.log(
      result.reason === "no-manifest"
        ? "No IndexNow release manifest changed; skipping submission."
        : "Changed IndexNow release manifests contain no URLs; skipping submission.",
    );
    return;
  }

  if (result.kind === "failed") {
    console.error(`::error::${result.error}`);
    return;
  }

  console.log(
    `IndexNow accepted ${result.urls.length} explicitly declared URL change(s) with HTTP ${result.httpStatus}.`,
  );
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  void main();
}
