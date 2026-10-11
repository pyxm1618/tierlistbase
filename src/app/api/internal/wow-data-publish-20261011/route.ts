import { NextResponse } from "next/server";
import postgres from "postgres";

import {
  buildWowForeverDataCandidate,
  publishWowForeverDataCandidate,
} from "@/modules/meta-board/data/forever-logs-publisher";

const BRANCH = "chore/wow-data-publish-20261011";

export async function GET(request: Request) {
  if (process.env.VERCEL_GIT_COMMIT_REF !== BRANCH) {
    return NextResponse.json({ error: "disabled" }, { status: 404 });
  }

  const apiKey = process.env.FOREVER_LOGS_API_KEY;
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return NextResponse.json({ error: "DATABASE_URL_missing" }, { status: 500 });
  }

  const url = new URL(request.url);
  if (url.searchParams.get("verify") === "1") {
    const sql = postgres(databaseUrl, { max: 1, prepare: false });
    try {
      const [games, versions, contexts, entities, sources, sourceRatings, ratings] =
        await Promise.all([
          sql`select id, slug, current_version_id from games where slug = 'wow-forever'`,
          sql`
            select id, version, build, level_cap, status
            from game_versions
            where game_id in (select id from games where slug = 'wow-forever')
          `,
          sql`
            select id, slug, mode, role, level_cap, label, status
            from ranking_contexts
            where game_id in (select id from games where slug = 'wow-forever')
            order by role
          `,
          sql`
            select id, name, slug, role, status
            from entities
            where game_id in (select id from games where slug = 'wow-forever')
            order by role, name
          `,
          sql`
            select id, name, url, source_type, publisher, freshness_status
            from sources
            where name = 'TierListBase Data Ranking · Forever Logs'
          `,
          sql`
            select sr.entity_id, e.name as entity_name, rc.role, sr.raw_tier,
                   sr.raw_rank, sr.raw_score, sr.sample_size, sr.collected_at
            from source_ratings sr
            join entities e on e.id = sr.entity_id
            join ranking_contexts rc on rc.id = sr.ranking_context_id
            join sources s on s.id = sr.source_id
            where s.name = 'TierListBase Data Ranking · Forever Logs'
            order by rc.role, sr.raw_rank nulls last, e.name
          `,
          sql`
            select e.name as entity_name, rc.role, r.tier, r.consensus_score,
                   r.data_status, r.freshness_status, r.why_this_tier
            from ratings r
            join entities e on e.id = r.entity_id
            join ranking_contexts rc on rc.id = r.ranking_context_id
            where e.game_id in (select id from games where slug = 'wow-forever')
            order by rc.role,
              case r.tier when 'S' then 1 when 'A' then 2 when 'B' then 3 when 'C' then 4 else 5 end,
              r.consensus_score desc nulls last,
              e.name
          `,
        ]);

      return NextResponse.json({
        verifiedAt: new Date().toISOString(),
        counts: {
          games: games.length,
          versions: versions.length,
          contexts: contexts.length,
          entities: entities.length,
          sources: sources.length,
          sourceRatings: sourceRatings.length,
          ratings: ratings.length,
        },
        games,
        versions,
        contexts,
        ratings,
      });
    } finally {
      await sql.end({ timeout: 1 });
    }
  }

  if (url.searchParams.get("publish") !== "1") {
    return NextResponse.json({ error: "publish_or_verify_required" }, { status: 400 });
  }
  if (!apiKey) {
    return NextResponse.json({ error: "FOREVER_LOGS_API_KEY_missing" }, { status: 500 });
  }

  const candidate = await buildWowForeverDataCandidate({ apiKey });
  const result = await publishWowForeverDataCandidate({ candidate, databaseUrl });

  return NextResponse.json({
    publishedAt: candidate.retrievedAt.toISOString(),
    phase: candidate.phaseName,
    result,
    rankings: candidate.rankings.map((ranking) => ({
      role: ranking.item.role,
      entity: `${ranking.item.specName} ${ranking.item.className}`,
      score: ranking.item.weightedMedianScore,
      sampleSize: ranking.item.sampleCount,
      locations: ranking.item.locationsIncluded.length,
      confidence: ranking.item.confidence,
      flags: ranking.item.flags,
      tier: ranking.tier.tier,
      dataStatus: ranking.tier.dataStatus,
    })),
  });
}
