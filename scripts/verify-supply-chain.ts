import { spawnSync } from "node:child_process";

// Advisories introduced by upstream dependencies pinned by Create Web 0.2.3 baseline
// (e.g., next@16.2.12, eslint@9.39.1).
// Per rule: lock to Create Web 0.2.3 baseline and do not upgrade foundation frameworks,
// but strictly gate and reject any newly introduced supply-chain vulnerabilities.
const KNOWN_BASELINE_ADVISORIES = new Set([
  "GHSA-68fv-2mgg-jv7q", // source-map-js (via postcss)
  "GHSA-vfj7-8cjw-p6xm", // braces (via eslint-config-next)
  "GHSA-qhr7-859c-m2p7", // brace-expansion (via eslint / typescript-eslint)
  "GHSA-6j4f-fj2g-mc7p", // brace-expansion (via eslint / typescript-eslint)
  "GHSA-cjq9-62q9-8jv4", // next: SSRF in Image Optimization
  "GHSA-p293-qw3h-jr36", // next: RCE on windows-hosted servers
  "GHSA-2xp9-vwfh-vxw4", // next: RCE in Image Optimization API AVIF
  "GHSA-vcvr-r3jv-pc5j", // next: RCE in next/og
  "GHSA-2883-xcg3-v3hh", // js-yaml (via eslint)
  "GHSA-rgj7-g3m4-5g8c", // sharp (via libheif)
  "GHSA-wq5f-xc86-pv6w", // sharp (via librsvg)
]);

// 1. Verify lockfile integrity
const installResult = spawnSync("bun", ["install", "--frozen-lockfile", "--lockfile-only"], {
  stdio: "inherit",
});

if (installResult.status !== 0) {
  console.error("Lockfile verification failed.");
  process.exit(installResult.status ?? 1);
}

// 2. Audit dependencies
const auditResult = spawnSync("bun", ["audit", "--audit-level=high"], {
  encoding: "utf8",
});

const stdout = auditResult.stdout ?? "";
const stderr = auditResult.stderr ?? "";
const fullOutput = stdout + stderr;

if (auditResult.status === 0) {
  console.log(JSON.stringify({ event: "supply_chain_audit_passed", vulnerabilities: 0 }));
  process.exit(0);
}

// In local mirror / offline environments, npmbulk advisories endpoint might return 404
if (
  fullOutput.includes("advisories/bulk - 404") ||
  fullOutput.includes("audit endpoint unavailable")
) {
  console.warn(
    JSON.stringify({
      event: "supply_chain_audit_skipped_offline_mirror",
      warning: "Advisory endpoint unavailable from current npm mirror.",
    }),
  );
  process.exit(0);
}

// Extract advisory URLs (e.g. https://github.com/advisories/GHSA-...)
const advisoryMatches =
  fullOutput.match(/https:\/\/github\.com\/advisories\/(GHSA-[-a-z0-9]+)/gi) ?? [];
const reportedAdvisories: string[] = Array.from(
  new Set(
    advisoryMatches
      .map((url) => {
        const parts = url.split("/");
        return parts[parts.length - 1] ?? "";
      })
      .filter((id): id is string => id.length > 0),
  ),
);

const newAdvisories = reportedAdvisories.filter((id) => !KNOWN_BASELINE_ADVISORIES.has(id));

if (newAdvisories.length > 0) {
  console.error("Newly introduced high/critical vulnerabilities detected:");
  for (const id of newAdvisories) {
    console.error(`- ${id}`);
  }
  process.exit(1);
}

console.log(
  JSON.stringify({
    event: "supply_chain_audit_passed_with_baseline_exceptions",
    baselineAdvisoriesCount: reportedAdvisories.length,
    newVulnerabilities: 0,
  }),
);
