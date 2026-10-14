import postgres from "postgres";
import { importReviewedPackage, readBackReviewedPackage } from "./editorial-import";
import { defaultPackageDirectory, packageLedger, readReviewedPackage } from "./editorial-package";

const command = process.argv[2];
if (!["validate", "import", "read-back"].includes(command ?? "")) {
  throw new Error(
    "Usage: bun scripts/reviewed-editorial.ts validate|import|read-back [package-directory]",
  );
}
const pkg = await readReviewedPackage(process.argv[3] ?? defaultPackageDirectory);
console.log(
  JSON.stringify({
    event: "reviewed_package_validated",
    entities: pkg.characters.length,
    ratings: pkg.ratings.length,
    sources: pkg.sources.length,
    evidence: pkg.evidence.length,
    ledger: packageLedger(pkg),
  }),
);
if (command !== "validate") {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required");
  const sql = postgres(url, { max: 1, connect_timeout: 10, prepare: false });
  try {
    const report =
      command === "import"
        ? await importReviewedPackage(sql, pkg)
        : await readBackReviewedPackage(sql, pkg);
    console.log(JSON.stringify({ event: "reviewed_package_" + command, ...report }));
    if (command === "import") {
      console.log(
        JSON.stringify({
          event: "independent_post_commit_read_back",
          ...(await readBackReviewedPackage(sql, pkg)),
        }),
      );
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}
