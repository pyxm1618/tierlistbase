
import { NextResponse } from "next/server";
import postgres from "postgres";

const API_BASE = "https://foreverlogs.gg/api/public/v1";

async function apiGet(path: string, apiKey: string) {
  const response = await fetch(API_BASE + path, {
    headers: {
      Authorization: "Bearer " + apiKey,
      Accept: "application/json",
      "User-Agent": "TierListBase/0.1 DataExecutionProbe",
    },
    cache: "no-store",
  });

  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {}

  return {
    ok: response.ok,
    status: response.status,
    remaining: response.headers.get("x-ratelimit-remaining"),
    body,
  };
}

export async function GET() {
  if (process.env.VERCEL_GIT_COMMIT_REF !== "chore/wow-data-exec-probe-20261011") {
    return NextResponse.json({ error: "probe_disabled" }, { status: 404 });
  }

  const apiKey = process.env.FOREVER_LOGS_API_KEY;
  const databaseUrl = process.env.DATABASE_URL;

  if (!apiKey || !databaseUrl) {
    return NextResponse.json(
      {
        error: "missing_required_secret",
        foreverLogsConfigured: Boolean(apiKey),
        databaseConfigured: Boolean(databaseUrl),
      },
      { status: 500 },
    );
  }

  const sql = postgres(databaseUrl, { max: 1, prepare: false });

  try {
    const games = await sql.unsafe(
      "select id, slug, name, publisher, status, current_version_id from games where slug = $1",
      ["wow-forever"],
    );
    const gameId = games[0]?.id ?? null;

    const versions = gameId
      ? await sql.unsafe(
          "select id, game_id, version, build, level_cap, status, release_date, valid_from, valid_to, notes from game_versions where game_id = $1 order by created_at desc",
          [gameId],
        )
      : [];
    const contexts = gameId
      ? await sql.unsafe(
          "select id, game_id, slug, mode, role, level_cap, label, status from ranking_contexts where game_id = $1 order by mode, role, level_cap nulls last",
          [gameId],
        )
      : [];
    const entities = gameId
      ? await sql.unsafe(
          "select id, game_id, parent_entity_id, entity_type, slug, name, role, status, sort_order from entities where game_id = $1 order by sort_order, name",
          [gameId],
        )
      : [];
    const sources = await sql.unsafe(
      "select id, name, url, source_type, publisher, published_at, updated_at_source, checked_at, freshness_status, notes from sources order by name",
    );
    const ratings = gameId
      ? await sql.unsafe(
          "select r.id, r.entity_id, e.name as entity_name, e.slug as entity_slug, e.role as entity_role, r.ranking_context_id, rc.slug as context_slug, rc.mode, rc.role as context_role, r.game_version_id, gv.version, gv.build, gv.level_cap, r.tier, r.consensus_score, r.source_count, r.agreeing_source_count, r.disagreement_level, r.data_status, r.freshness_status, r.why_this_tier, r.strengths, r.constraints, r.published_at, r.updated_at from ratings r join entities e on e.id = r.entity_id join ranking_contexts rc on rc.id = r.ranking_context_id join game_versions gv on gv.id = r.game_version_id where e.game_id = $1 order by rc.mode, rc.role, r.tier, e.name",
          [gameId],
        )
      : [];

    const phases = await apiGet("/phases", apiKey);
    let weeks: unknown = null;
    const phaseRows =
      phases.ok &&
      phases.body &&
      typeof phases.body === "object" &&
      "phases" in phases.body &&
      Array.isArray((phases.body as { phases?: unknown }).phases)
        ? ((phases.body as { phases: Array<Record<string, unknown>> }).phases ?? [])
        : [];

    const activePhase =
      phaseRows.find((phase) => phase.is_active === true) ??
      [...phaseRows].sort(
        (a, b) => Number(b.phase_number ?? b.id ?? 0) - Number(a.phase_number ?? a.id ?? 0),
      )[0];

    const phaseId = Number(activePhase?.id ?? activePhase?.phase_number);
    if (Number.isFinite(phaseId)) {
      weeks = await apiGet("/statistics/weeks?phase=" + encodeURIComponent(String(phaseId)), apiKey);
    }

    return NextResponse.json({
      probedAt: new Date().toISOString(),
      database: { games, versions, contexts, entities, sources, ratings },
      foreverLogs: { phases, activePhase, weeks },
    });
  } finally {
    await sql.end({ timeout: 1 });
  }
}
