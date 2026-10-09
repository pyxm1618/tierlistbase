import { describe, expect, it } from "vitest";
import packageJson from "../../../package.json";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";

describe("Supply Chain & Runtime Dependency Boundary Verification", () => {
  it("ensures unpatched dev-only packages like braces are strictly absent from production dependencies", () => {
    // 1. Direct production dependencies must not include braces
    const directDeps = Object.keys(packageJson.dependencies ?? {});
    expect(directDeps).not.toContain("braces");
    expect(directDeps).not.toContain("micromatch");
    expect(directDeps).not.toContain("fast-glob");

    // 2. Scan bun.lock to verify that no production dependency transitively depends on braces
    const lockfileContent = readFileSync(resolve(process.cwd(), "bun.lock"), "utf-8");
    const sanitizedJson = lockfileContent.replace(/,(\s*[}\]])/g, "$1");
    const lockData = JSON.parse(sanitizedJson);

    // Packages referenced by production dependencies
    const productionRoots = directDeps;
    const visited = new Set<string>();
    const queue = [...productionRoots];

    while (queue.length > 0) {
      const current = queue.shift()!;
      if (visited.has(current)) continue;
      visited.add(current);

      expect(current).not.toBe("braces");

      // Check dependencies in packages table if present
      const pkgInfo = lockData.packages?.[current];
      if (pkgInfo && Array.isArray(pkgInfo) && pkgInfo[2]?.dependencies) {
        for (const depName of Object.keys(pkgInfo[2].dependencies)) {
          expect(depName).not.toBe("braces");
          if (!visited.has(depName)) {
            queue.push(depName);
          }
        }
      }
    }

    expect(visited.has("braces")).toBe(false);
  });

  it("ensures all high/critical direct runtime dependencies are patched and secure", () => {
    // Next.js patched version >= 16.3.8 fixes all 4 known RCE/SSRF advisories
    const nextVersion = packageJson.dependencies.next;
    expect(nextVersion).toBe("16.3.8");

    // Sharp override >= 0.35.4 fixes libheif/librsvg advisories
    const overrides = (packageJson as { overrides?: Record<string, string> }).overrides;
    expect(overrides?.sharp).toBe("0.35.5");

    // Source-map-js override >= 1.2.2 fixes event-loop DoS
    expect(overrides?.["source-map-js"]).toBe("1.2.2");

    // Js-yaml override >= 4.3.2 fixes empty merge sources CPU exhaustion
    expect(overrides?.["js-yaml"]).toBe("4.3.2");
  });
});
