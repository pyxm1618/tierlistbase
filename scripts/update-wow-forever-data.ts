import {
  buildWowForeverDataCandidate,
  publishWowForeverDataCandidate,
} from "../src/modules/meta-board/data/forever-logs-publisher";

const apiKey = process.env.FOREVER_LOGS_API_KEY;
if (!apiKey) throw new Error("FOREVER_LOGS_API_KEY is required");

const candidate = await buildWowForeverDataCandidate({ apiKey });

const summary = candidate.rankings.map((ranking) => ({
  role: ranking.item.role,
  entity: `${ranking.item.specName} ${ranking.item.className}`,
  score: ranking.item.weightedMedianScore,
  sampleSize: ranking.item.sampleCount,
  locations: ranking.item.locationsIncluded.length,
  confidence: ranking.item.confidence,
  flags: ranking.item.flags,
  tier: ranking.tier.tier,
  status: ranking.tier.dataStatus,
}));

console.log(
  JSON.stringify(
    {
      phase: candidate.phaseName,
      retrievedAt: candidate.retrievedAt.toISOString(),
      dungeons: ["City of Dalaran", "Excavation Site: Wetlands", "Razorfen Downs", "Uldaman"],
      rankings: summary,
    },
    null,
    2,
  ),
);

if (process.argv.includes("--publish")) {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is required with --publish");
  const result = await publishWowForeverDataCandidate({ candidate, databaseUrl });
  console.log(JSON.stringify({ published: true, ...result }, null, 2));
} else {
  console.log("Dry run only. Re-run with --publish to write Neon.");
}
