import { expect, it } from "vitest";
import { legalConfig } from "@/config/legal.config";
it("describes the existing Google account, deletion, same database and UGC without disabled-account contradictions", () => {
  expect(legalConfig.accountDeletion.enabled).toBe(true);
  expect(JSON.stringify(legalConfig)).not.toMatch(
    /registration and login are disabled|does not maintain active user accounts|does not intentionally store visitor account profiles/,
  );
  for (const key of ["privacy", "terms", "acceptable_use", "account_deletion"] as const)
    expect(legalConfig.content[key].length).toBeGreaterThan(0);
  expect(legalConfig.releaseStatus).toBe("draft");
});
