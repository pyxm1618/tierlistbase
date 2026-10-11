
import { NextResponse } from "next/server";
import postgres from "postgres";

const API_BASE = "https://foreverlogs.gg/api/public/v1";
const LOCATIONS = [
  "City of Dalaran",
  "Ruins of Lordaeron",
  "Excavation Site: Wetlands",
  "The Hall of Thanes",
] as const;

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
  try { body = JSON.parse(text); } catch {}
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
    return NextResponse.json({ error: "missing_required_secret" }, { status: 500 });
  }

  const sql = postgres(databaseUrl, { max: 1, prepare: false });
  try {
    const games = await sql.unsafe(
      "select id, slug, name, publisher, status, current_version_id from games where slug = $1",
      ["wow-forever"],
    );

    const phases = await apiGet("/phases", apiKey);
    const phaseRows =
      phases.ok && phases.body && typeof phases.body === "object" &&
      "phases" in phases.body &&
      Array.isArray((phases.body as { phases?: unknown }).phases)
        ? (phases.body as { phases: Array<Record<string, unknown>> }).phases
        : [];
    const activePhase =
      phaseRows.find((phase) => phase.is_active === true) ??
      [...phaseRows].sort(
        (a, b) => Number(b.phase_number ?? b.id ?? 0) - Number(a.phase_number ?? a.id ?? 0),
      )[0];
    const phaseId = Number(activePhase?.id ?? activePhase?.phase_number);

    const statistics: Array<{
      location: string;
      metric: string;
      role: string | null;
      response: Awaited<ReturnType<typeof apiGet>>;
    }> = [];

    if (Number.isFinite(phaseId)) {
      const probes = [
        ...LOCATIONS.map((location) => ({ location, metric: "avg_dps", role: "dps" })),
        ...LOCATIONS.map((location) => ({ location, metric: "avg_hps", role: null })),
        ...LOCATIONS.map((location) => ({ location, metric: "avg_dtps", role: "tank" })),
      ];

      for (const probe of probes) {
        const params = new URLSearchParams({
          phase: String(phaseId),
          location: probe.location,
          metric: probe.metric,
          difficulty: "all",
          bracket: "all",
          damageMode: "standard",
        });
        if (probe.role) params.set("role", probe.role);
        const response = await apiGet("/statistics?" + params.toString(), apiKey);
        statistics.push({ ...probe, response });
      }
    }

    return NextResponse.json({
      probedAt: new Date().toISOString(),
      databaseEmpty: games.length === 0,
      activePhase,
      statistics,
    });
  } finally {
    await sql.end({ timeout: 1 });
  }
}
