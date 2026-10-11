import { NextResponse } from "next/server";

const API_BASE = "https://foreverlogs.gg/api/public/v1";
const LOCATIONS = [
  "City of Dalaran",
  "Ruins of Lordaeron",
  "Excavation Site: Wetlands",
  "The Hall of Thanes",
] as const;

type JsonRecord = Record<string, unknown>;

async function apiGet(path: string, apiKey: string) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "User-Agent": "TierListBase/0.1 ForeverLogsProbe",
    },
    cache: "no-store",
  });
  const text = await response.text();
  let body: unknown = text;
  try {
    body = JSON.parse(text);
  } catch {}
  return {
    status: response.status,
    ok: response.ok,
    remaining: response.headers.get("x-ratelimit-remaining"),
    body,
  };
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
}

function summarizeStatistics(body: unknown) {
  const root = asRecord(body);
  const classes = asRecord(root?.statistics);
  const rows: Array<Record<string, unknown>> = [];

  if (classes) {
    for (const [className, classValue] of Object.entries(classes)) {
      const classRecord = asRecord(classValue);
      const specs = asRecord(classRecord?.specs);
      if (!specs) continue;
      for (const [specName, specValue] of Object.entries(specs)) {
        const spec = asRecord(specValue);
        if (!spec) continue;
        const percentiles = asRecord(spec.percentiles);
        rows.push({
          class: className,
          spec: specName,
          avg: spec.avg ?? null,
          median: spec.median ?? null,
          totalParses: spec.total_parses ?? null,
          p95: percentiles?.p95 ?? null,
          p75: percentiles?.p75 ?? null,
          p50: percentiles?.p50 ?? null,
        });
      }
    }
  }

  return {
    phase: root?.phase ?? null,
    phaseName: root?.phase_name ?? null,
    location: root?.location ?? null,
    difficulty: root?.difficulty ?? null,
    bracket: root?.bracket ?? null,
    metric: root?.metric ?? null,
    damageMode: root?.damage_mode ?? null,
    specCount: rows.length,
    totalParses: rows.reduce(
      (sum, row) => sum + (typeof row.totalParses === "number" ? row.totalParses : 0),
      0,
    ),
    rows,
  };
}

export async function GET() {
  if (process.env.VERCEL_GIT_COMMIT_REF !== "chore/forever-logs-probe-20261011") {
    return NextResponse.json({ error: "probe_disabled_outside_probe_branch" }, { status: 404 });
  }

  const apiKey = process.env.FOREVER_LOGS_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "FOREVER_LOGS_API_KEY_missing" }, { status: 500 });
  }

  const phases = await apiGet("/phases", apiKey);
  if (!phases.ok) return NextResponse.json({ phases }, { status: 502 });

  const phaseRoot = asRecord(phases.body);
  const phaseRows = Array.isArray(phaseRoot?.phases) ? phaseRoot.phases : [];
  const phaseRecords = phaseRows.map(asRecord).filter((x): x is JsonRecord => Boolean(x));
  const activePhase =
    phaseRecords.find((row) => row.is_active === true) ??
    [...phaseRecords].sort(
      (a, b) => Number(b.phase_number ?? b.id ?? 0) - Number(a.phase_number ?? a.id ?? 0),
    )[0];

  const phaseId = Number(activePhase?.id ?? activePhase?.phase_number);
  if (!Number.isFinite(phaseId)) {
    return NextResponse.json({ error: "no_phase_id" }, { status: 502 });
  }

  const probes = [
    ...LOCATIONS.map((location) => ({ location, metric: "avg_dps", role: "dps" })),
    ...LOCATIONS.map((location) => ({ location, metric: "avg_hps", role: null })),
    ...LOCATIONS.map((location) => ({ location, metric: "avg_dtps", role: "tank" })),
  ];

  const results = [];
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

    const response = await apiGet(`/statistics?${params.toString()}`, apiKey);
    results.push({
      request: probe,
      status: response.status,
      remaining: response.remaining,
      summary: response.ok ? summarizeStatistics(response.body) : response.body,
    });
  }

  return NextResponse.json({
    probedAt: new Date().toISOString(),
    activePhase,
    rateLimitAfterPhases: phases.remaining,
    results,
  });
}
