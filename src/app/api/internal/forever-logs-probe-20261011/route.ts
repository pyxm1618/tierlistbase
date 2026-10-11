import { NextResponse } from "next/server";

const API_BASE = "https://foreverlogs.gg/api/public/v1";

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
    rateLimit: {
      limit: response.headers.get("x-ratelimit-limit"),
      remaining: response.headers.get("x-ratelimit-remaining"),
      reset: response.headers.get("x-ratelimit-reset"),
      retryAfter: response.headers.get("retry-after"),
    },
    body,
  };
}

function asRecord(value: unknown): JsonRecord | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as JsonRecord)
    : null;
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
  if (!phases.ok) {
    return NextResponse.json({ phases }, { status: 502 });
  }

  const phasesBody = asRecord(phases.body);
  const phaseRows = Array.isArray(phasesBody?.phases) ? phasesBody.phases : [];
  const phaseRecords = phaseRows.map(asRecord).filter((x): x is JsonRecord => Boolean(x));
  const activePhase =
    phaseRecords.find((row) => row.is_active === true) ??
    [...phaseRecords].sort(
      (a, b) => Number(b.phase_number ?? b.id ?? 0) - Number(a.phase_number ?? a.id ?? 0),
    )[0];

  const phaseId = Number(activePhase?.id ?? activePhase?.phase_number);
  if (!Number.isFinite(phaseId)) {
    return NextResponse.json(
      {
        error: "no_phase_id",
        phases: {
          status: phases.status,
          rateLimit: phases.rateLimit,
          body: phases.body,
        },
      },
      { status: 502 },
    );
  }

  const [statistics, bosses] = await Promise.all([
    apiGet(`/statistics?phase=${encodeURIComponent(String(phaseId))}`, apiKey),
    apiGet("/bosses", apiKey),
  ]);

  return NextResponse.json({
    probedAt: new Date().toISOString(),
    phaseId,
    activePhase,
    phases: {
      status: phases.status,
      rateLimit: phases.rateLimit,
      count: phaseRecords.length,
      rows: phaseRecords,
    },
    statistics: {
      status: statistics.status,
      rateLimit: statistics.rateLimit,
      body: statistics.body,
    },
    bosses: {
      status: bosses.status,
      rateLimit: bosses.rateLimit,
      body: bosses.body,
    },
  });
}
