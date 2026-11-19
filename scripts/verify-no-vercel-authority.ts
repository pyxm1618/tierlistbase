import { spawnSync } from "node:child_process";
import { readFile } from "node:fs/promises";

const GUARD_FILE = "scripts/verify-no-vercel-authority.ts";
const ALLOWED_EXISTING_VERCEL_CONFIGS = new Set(["examples/neutral-product/vercel.json"]);
const DEPENDENCY_SECTIONS = [
  "dependencies",
  "devDependencies",
  "optionalDependencies",
  "peerDependencies",
];

function trackedFiles(): string[] {
  const result = spawnSync("git", ["ls-files", "-z"]);
  if (result.status !== 0) {
    throw new Error(`git ls-files failed: ${result.stderr.toString("utf8").trim()}`);
  }
  return result.stdout.toString("utf8").split("\0").filter(Boolean).sort();
}

function isTextCandidate(file: string): boolean {
  return (
    file === "package.json" ||
    file.startsWith(".github/workflows/") ||
    file.startsWith("scripts/") ||
    file.startsWith("config/") ||
    file.startsWith("src/")
  );
}

const forbiddenPathPatterns = [
  { label: "Vercel project metadata", pattern: /(^|\/)\.vercel(?:\/|$)/ },
  { label: "Vercel deployment configuration", pattern: /(^|\/)vercel\.json$/i },
];

const forbiddenOperationalPatterns = [
  {
    label: "Vercel access-token or project-authority reference",
    pattern: /\bVERCEL_(?:TOKEN|ORG_ID|PROJECT_ID|STAGING_TOKEN)\b/,
  },
  { label: "Vercel MCP endpoint", pattern: /\bmcp\.vercel\.com\b/i },
  {
    label: "Vercel CLI deployment/project command",
    pattern: /\bvercel\s+(?:deploy|project|link|pull|build|promote|rollback)\b/i,
  },
  { label: "Vercel CLI production shortcut", pattern: /\bvercel\s+--prod\b/i },
];

const findings = [];
const files = trackedFiles();

for (const file of files) {
  if (ALLOWED_EXISTING_VERCEL_CONFIGS.has(file)) continue;
  for (const rule of forbiddenPathPatterns) {
    if (rule.pattern.test(file)) findings.push(`${file}: ${rule.label}`);
  }
}

const packageJson = JSON.parse(await readFile("package.json", "utf8"));
for (const section of DEPENDENCY_SECTIONS) {
  const dependencies = packageJson[section];
  if (!dependencies || typeof dependencies !== "object" || Array.isArray(dependencies)) continue;
  for (const name of Object.keys(dependencies)) {
    if (name === "vercel" || name.startsWith("@vercel/")) {
      findings.push(`package.json: unauthorized Vercel dependency ${name} in ${section}`);
    }
  }
}

for (const file of files) {
  if (file === GUARD_FILE || !isTextCandidate(file)) continue;
  let content: string;
  try {
    content = await readFile(file, "utf8");
  } catch {
    continue;
  }
  for (const rule of forbiddenOperationalPatterns) {
    if (rule.pattern.test(content)) findings.push(`${file}: ${rule.label}`);
  }
}

if (findings.length > 0) {
  for (const finding of findings) {
    console.error(finding);
  }
  throw new Error(
    "TierListBase has no authorized Vercel deployment path. " +
      "Remove Vercel deployment authority or obtain explicit authorization for an architecture change.",
  );
}

console.log(
  JSON.stringify({
    event: "vercel_deployment_authority_verified",
    trackedFiles: files.length,
    authorizedDeployment: "cloudflare",
  }),
);
