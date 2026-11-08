import { readFileSync } from "node:fs";

import { describe, expect, it, vi } from "vitest";

import {
  runIndexNowProductionWiring,
  type IndexNowProductionDependencies,
} from "../../../scripts/submit-indexnow-production";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};

function harness(input: {
  changedFiles: string[];
  manifests?: Record<string, string>;
  submitStatus?: number;
}) {
  const listChangedFiles = vi.fn(async () => input.changedFiles);
  const readManifest = vi.fn(async (path: string) => input.manifests?.[path] ?? "");
  const submit = vi.fn(async () => input.submitStatus ?? 202);
  const dependencies: IndexNowProductionDependencies = {
    listChangedFiles,
    readManifest,
    submit,
  };

  return { dependencies, listChangedFiles, readManifest, submit };
}

const runInput = {
  base: "base-sha",
  head: "head-sha",
  cronSecret: "test-secret",
};

describe("IndexNow production wiring", () => {
  it("exposes the existing CLI through the documented package script", () => {
    expect(packageJson.scripts["seo:indexnow"]).toBe("bun scripts/submit-indexnow.ts");
  });

  it("runs the shared authoritative script only after the production deploy", () => {
    const deployMarker = "- name: Deploy current main to Production";
    const submitMarker = "- name: Submit explicitly declared IndexNow URL changes";
    const deployIndex = workflow.indexOf(deployMarker);
    const submitIndex = workflow.indexOf(submitMarker);

    expect(deployIndex).toBeGreaterThanOrEqual(0);
    expect(submitIndex).toBeGreaterThan(deployIndex);

    const submitBlock = workflow.slice(submitIndex);
    expect(submitBlock).toContain("if: ${{ success() }}");
    expect(submitBlock).toContain("continue-on-error: true");
    expect(submitBlock).toContain("bun scripts/submit-indexnow-production.ts");
    expect(submitBlock).not.toContain("curl ");
  });

  it("submits exactly the URLs from changed release manifests", async () => {
    const first = ".github/indexnow/releases/release-a.txt";
    const second = ".github/indexnow/releases/release-b.txt";
    const { dependencies, submit } = harness({
      changedFiles: [first, "src/app/page.tsx", second],
      manifests: {
        [first]: [
          "# release a",
          "https://www.tierlistbase.com/wow-forever/tier-list",
          "",
          "https://www.tierlistbase.com/genshin-impact/tier-list",
        ].join("\n"),
        [second]: "https://www.tierlistbase.com/nikke/tier-list\n",
      },
    });

    const result = await runIndexNowProductionWiring(runInput, dependencies);

    expect(result).toEqual({
      kind: "submitted",
      urls: [
        "https://www.tierlistbase.com/wow-forever/tier-list",
        "https://www.tierlistbase.com/genshin-impact/tier-list",
        "https://www.tierlistbase.com/nikke/tier-list",
      ],
      httpStatus: 202,
    });
    expect(submit).toHaveBeenCalledTimes(1);
    expect(submit).toHaveBeenCalledWith(
      [
        "https://www.tierlistbase.com/wow-forever/tier-list",
        "https://www.tierlistbase.com/genshin-impact/tier-list",
        "https://www.tierlistbase.com/nikke/tier-list",
      ],
      "test-secret",
    );
  });

  it("treats an unrelated deploy as a successful no-op with no sitemap or route fallback", async () => {
    const { dependencies, submit } = harness({
      changedFiles: ["public/sitemap.xml", "src/config/routes.config.ts", "src/app/page.tsx"],
    });

    const result = await runIndexNowProductionWiring(runInput, dependencies);

    expect(result).toEqual({ kind: "skipped", reason: "no-manifest", urls: [] });
    expect(submit).not.toHaveBeenCalled();
  });

  it("treats a release with no changed manifest as a successful no-op", async () => {
    const { dependencies, submit } = harness({ changedFiles: [] });

    const result = await runIndexNowProductionWiring(runInput, dependencies);

    expect(result).toEqual({ kind: "skipped", reason: "no-manifest", urls: [] });
    expect(submit).not.toHaveBeenCalled();
  });

  it("treats changed but empty manifests as a successful no-op", async () => {
    const manifest = ".github/indexnow/releases/empty.txt";
    const { dependencies, submit } = harness({
      changedFiles: [manifest],
      manifests: { [manifest]: "  \n# comment only\n\t\n" },
    });

    const result = await runIndexNowProductionWiring(runInput, dependencies);

    expect(result).toEqual({ kind: "skipped", reason: "empty-manifest", urls: [] });
    expect(submit).not.toHaveBeenCalled();
  });

  it("observes submission failure without throwing into the production deploy path", async () => {
    const manifest = ".github/indexnow/releases/release.txt";
    const baseHarness = harness({
      changedFiles: [manifest],
      manifests: { [manifest]: "https://www.tierlistbase.com/wild-rift/tier-list\n" },
    });
    const submit = vi.fn(async () => {
      throw new Error("network down");
    });
    const dependencies: IndexNowProductionDependencies = {
      ...baseHarness.dependencies,
      submit,
    };

    await expect(runIndexNowProductionWiring(runInput, dependencies)).resolves.toEqual({
      kind: "failed",
      urls: [],
      error: "network down",
    });
    expect(submit).toHaveBeenCalledTimes(1);
  });
});
