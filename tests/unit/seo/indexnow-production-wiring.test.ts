import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const workflow = readFileSync(".github/workflows/ci.yml", "utf8");
const packageJson = JSON.parse(readFileSync("package.json", "utf8")) as {
  scripts: Record<string, string>;
};

describe("IndexNow production wiring", () => {
  it("exposes the existing CLI through the documented package script", () => {
    expect(packageJson.scripts["seo:indexnow"]).toBe("bun scripts/submit-indexnow.ts");
  });

  it("runs only after the production deploy and cannot fail the deployment job", () => {
    const deployMarker = "- name: Deploy current main to Production";
    const submitMarker = "- name: Submit explicitly declared IndexNow URL changes";
    const deployIndex = workflow.indexOf(deployMarker);
    const submitIndex = workflow.indexOf(submitMarker);

    expect(deployIndex).toBeGreaterThanOrEqual(0);
    expect(submitIndex).toBeGreaterThan(deployIndex);

    const submitBlock = workflow.slice(submitIndex);
    expect(submitBlock).toContain("if: ${{ success() }}");
    expect(submitBlock).toContain("continue-on-error: true");
  });

  it("submits only explicitly declared changed-URL manifests and has no full-site fallback", () => {
    const submitIndex = workflow.indexOf("- name: Submit explicitly declared IndexNow URL changes");
    const submitBlock = workflow.slice(submitIndex);

    expect(submitBlock).toContain(
      "git diff --diff-filter=AM --name-only \"$base\" \"$GITHUB_SHA\" -- '.github/indexnow/releases/*.txt'",
    );
    expect(submitBlock).toContain("No IndexNow release manifest changed; skipping submission.");
    expect(submitBlock).toContain("Changed IndexNow release manifests contain no URLs; skipping submission.");
    expect(submitBlock).toContain("https://www.tierlistbase.com/api/internal/seo/indexnow");
    expect(submitBlock).toContain("CRON_SECRET: ${{ secrets.CRON_SECRET }}");
    expect(submitBlock).not.toContain("sitemap.xml");
    expect(submitBlock).not.toContain("public_indexable");
    expect(submitBlock).not.toContain("routeRegistry");
  });
});
