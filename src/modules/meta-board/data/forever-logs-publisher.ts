import "server-only";

import { createHash } from "node:crypto";

import postgres from "postgres";

import {
  foreverLogsSpecKey,
  parseForeverLogsStatisticsPayload,
  processForeverLogsDataRanking,
  type ForeverLogsDataRankingItem,
  type ForeverLogsObservation,
  type ForeverLogsRole,
} from "../domain/forever-logs-data-ranking";
import { deriveForeverLogsDataTier } from "../domain/forever-logs-data-tier";

const FOREVER_LOGS_API_BASE = "https://foreverlogs.gg/api/public/v1";
const FOREVER_LOGS_SOURCE_URL = "https://foreverlogs.gg/";
const BLIZZARD_NOTES_URL =
  "https://us.forums.blizzard.com/en/wow/t/wow-forever-beta-development-notes-%E2%80%93-updated-october-8/2360696";

export const WOW_FOREVER_NEAR_CAP_DUNGEONS = [
  { name: "City of Dalaran", levelRange: "28-33" },
  { name: "Excavation Site: Wetlands", levelRange: "24-29" },
  { name: "Razorfen Downs", levelRange: "25+" },
  { name: "Uldaman", levelRange: "30+" },
] as const;

const HEALER_SPECS = new Set([
  "Priest::Discipline",
  "Priest::Holy",
  "Druid::Restoration",
  "Shaman::Restoration",
  "Paladin::Holy",
]);

const TANK_SPECS = new Set([
  "Druid::Guardian",
  "Druid::Feral Combat",
  "Paladin::Protection",
  "Warrior::Protection",
]);

type ApiResponse = {
  readonly ok: boolean;
  readonly status: number;
  readonly remaining: string | null;
  readonly body: unknown;
};

type PublishedRanking = {
  readonly item: ForeverLogsDataRankingItem;
  readonly tier: ReturnType<typeof deriveForeverLogsDataTier>;
  readonly rank: number | null;
};

export type WowForeverDataCandidate = {
  readonly retrievedAt: Date;
  readonly phaseId: number;
  readonly phaseName: string;
  readonly observations: readonly ForeverLogsObservation[];
  readonly rankings: readonly PublishedRanking[];
};

export type WowForeverPublishResult = {
  readonly gameId: string;
  readonly versionId: string;
  readonly contexts: number;
  readonly entities: number;
  readonly sourceRatings: number;
  readonly ratings: number;
  readonly changes: number;
};

function stableId(prefix: string, ...parts: readonly string[]) {
  const hash = createHash("sha256").update(parts.join("|")).digest("hex");
  return prefix + hash.slice(0, 36 - prefix.length);
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function apiGet(path: string, apiKey: string): Promise<ApiResponse> {
  const response = await fetch(FOREVER_LOGS_API_BASE + path, {
    headers: {
      Authorization: "Bearer " + apiKey,
      Accept: "application/json",
      "User-Agent": "TierListBase/0.1 WoWForeverDataUpdate",
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

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function buildRoleCatalog(observations: readonly ForeverLogsObservation[]) {
  const roleBySpec: Record<string, ForeverLogsRole> = {};

  for (const observation of observations) {
    const key = foreverLogsSpecKey(observation.className, observation.specName);
    if (observation.metric === "avg_dps") roleBySpec[key] = "dps";
  }

  for (const key of HEALER_SPECS) roleBySpec[key] = "healer";
  for (const key of TANK_SPECS) roleBySpec[key] = "tank";

  return roleBySpec;
}

function isRealRoleItem(
  item: ForeverLogsDataRankingItem,
  roleBySpec: Readonly<Record<string, ForeverLogsRole>>,
) {
  return roleBySpec[foreverLogsSpecKey(item.className, item.specName)] === item.role;
}

function rankingSort(a: ForeverLogsDataRankingItem, b: ForeverLogsDataRankingItem) {
  if (a.role !== b.role) return a.role.localeCompare(b.role);
  if (a.weightedMedianScore === null && b.weightedMedianScore !== null) return 1;
  if (a.weightedMedianScore !== null && b.weightedMedianScore === null) return -1;
  return (b.weightedMedianScore ?? -Infinity) - (a.weightedMedianScore ?? -Infinity);
}

export async function buildWowForeverDataCandidate(input: {
  readonly apiKey: string;
  readonly now?: Date;
}): Promise<WowForeverDataCandidate> {
  const retrievedAt = input.now ?? new Date();
  const phases = await apiGet("/phases", input.apiKey);
  if (!phases.ok) {
    throw new Error(`Forever Logs /phases failed with HTTP ${phases.status}`);
  }

  const phaseRoot = asRecord(phases.body);
  const phaseRows = Array.isArray(phaseRoot?.phases)
    ? (phaseRoot.phases as Array<Record<string, unknown>>)
    : [];
  const activePhase =
    phaseRows.find((phase) => phase.is_active === true) ??
    [...phaseRows].sort(
      (a, b) => Number(b.phase_number ?? b.id ?? 0) - Number(a.phase_number ?? a.id ?? 0),
    )[0];

  const phaseId = Number(activePhase?.id ?? activePhase?.phase_number);
  if (!Number.isFinite(phaseId)) throw new Error("Forever Logs returned no active phase");

  const observations: ForeverLogsObservation[] = [];

  const probes = [
    ...WOW_FOREVER_NEAR_CAP_DUNGEONS.map((dungeon) => ({
      location: dungeon.name,
      metric: "avg_dps" as const,
      role: "dps",
    })),
    ...WOW_FOREVER_NEAR_CAP_DUNGEONS.map((dungeon) => ({
      location: dungeon.name,
      metric: "avg_hps" as const,
      role: null,
    })),
    ...WOW_FOREVER_NEAR_CAP_DUNGEONS.map((dungeon) => ({
      location: dungeon.name,
      metric: "avg_dtps" as const,
      role: "tank",
    })),
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

    const response = await apiGet("/statistics?" + params.toString(), input.apiKey);
    if (!response.ok) {
      throw new Error(
        `Forever Logs statistics failed for ${probe.location}/${probe.metric} with HTTP ${response.status}`,
      );
    }

    const parsed = parseForeverLogsStatisticsPayload(response.body, {
      retrievedAt,
      sourceUrl: FOREVER_LOGS_SOURCE_URL,
      apiPath: "/api/public/v1/statistics?" + params.toString(),
    });
    if (parsed.issues.some((issue) => issue.reason !== "invalid_spec_statistics")) {
      throw new Error(
        `Forever Logs payload validation failed for ${probe.location}/${probe.metric}`,
      );
    }
    observations.push(...parsed.observations);
  }

  const roleBySpec = buildRoleCatalog(observations);
  const dataRankings = processForeverLogsDataRanking({
    observations,
    roleBySpec,
  })
    .filter((item) => isRealRoleItem(item, roleBySpec))
    .sort(rankingSort);

  const rankings: PublishedRanking[] = [];
  for (const role of ["dps", "healer", "tank"] as const) {
    const roleItems = dataRankings.filter((item) => item.role === role);
    let rank = 0;
    for (const item of roleItems) {
      const tier = deriveForeverLogsDataTier(item);
      const hasScore = item.weightedMedianScore !== null;
      if (hasScore) rank += 1;
      rankings.push({
        item,
        tier,
        rank: hasScore ? rank : null,
      });
    }
  }

  return {
    retrievedAt,
    phaseId,
    phaseName: String(activePhase?.name ?? "Beta"),
    observations,
    rankings,
  };
}

function contextForRole(role: ForeverLogsRole) {
  return {
    id: stableId("c-", "wow-forever", "dungeon", role, "30"),
    slug: `dungeon-${role}-30`,
    mode: "dungeon",
    role,
    levelCap: 30,
    label: `Dungeon • ${role.toUpperCase()} • Level Cap 30`,
  };
}

function entityIdentity(item: ForeverLogsDataRankingItem) {
  return {
    id: stableId("e-", "wow-forever", item.className, item.specName),
    slug: slugify(`${item.specName}-${item.className}`),
    name: `${item.specName} ${item.className}`,
    role: item.role,
  };
}

function observationNotes(item: ForeverLogsDataRankingItem, retrievedAt: Date) {
  return JSON.stringify({
    derivedBy: "TierListBase",
    dataSource: "Forever Logs Public API",
    attributionUrl: FOREVER_LOGS_SOURCE_URL,
    retrievedAt: retrievedAt.toISOString(),
    confidence: item.confidence,
    flags: item.flags,
    scoreDefinition:
      "100 = median eligible spec in the same dungeon; cross-dungeon score is parse-count weighted",
    tierBands: "S >= 120; A >= 105; B >= 90; C < 90",
    minimumEvidence: ">=5 parses per dungeon; >=2 near-cap dungeons; >=20 included parses",
    dungeons: item.observations
      .filter((observation) => observation.expectedRole === item.role)
      .map((observation) => ({
        location: observation.location,
        median: observation.median,
        avg: observation.avg,
        min: observation.min,
        max: observation.max,
        p95: observation.percentiles.p95 ?? null,
        sampleSize: observation.totalParses,
        included: observation.included,
        normalizedScore: observation.normalizedScore,
        flags: observation.flags,
      })),
  });
}

function explanation(item: ForeverLogsDataRankingItem, tier: PublishedRanking["tier"]) {
  if (tier.tier === "Pending" || item.weightedMedianScore === null) {
    return (
      "Pending: current Forever Logs evidence does not meet TierListBase's minimum " +
      "coverage of 2 near-cap dungeons and 20 included parses."
    );
  }
  return (
    `Forever Logs data score ${item.weightedMedianScore.toFixed(1)} across ` +
    `${item.sampleCount} included parses in ${item.locationsIncluded.length} near-cap dungeons. ` +
    "A score of 100 represents the median eligible spec within the same dungeon."
  );
}

function constraints(item: ForeverLogsDataRankingItem, tier: PublishedRanking["tier"]) {
  const parts = [
    "Current WoW Forever Beta only.",
    "Forever Logs aggregate statistics do not expose a player-level filter, so TierListBase limits this context to dungeons at or near the current level-30 cap.",
    "No Level-60 simulation data is mixed into this ranking.",
  ];
  if (tier.preliminary) {
    parts.push(
      item.flags.includes("extreme_tail")
        ? "Preliminary because the observed distribution contains an extreme upper tail."
        : "Preliminary because current sample coverage is still limited.",
    );
  }
  return parts.join(" ");
}

export async function publishWowForeverDataCandidate(input: {
  readonly candidate: WowForeverDataCandidate;
  readonly databaseUrl: string;
}): Promise<WowForeverPublishResult> {
  const sql = postgres(input.databaseUrl, { max: 1, prepare: false });

  const gameId = stableId("g-", "wow-forever");
  const versionId = stableId("v-", "wow-forever", "beta", "2026-10-08", "level-30");
  const sourceId = stableId("s-", "tierlistbase", "forever-logs", "data-ranking");
  const contexts = (["dps", "healer", "tank"] as const).map(contextForRole);
  const contextIds = contexts.map((context) => context.id);

  const uniqueItems = new Map<
    string,
    { item: ForeverLogsDataRankingItem; entity: ReturnType<typeof entityIdentity> }
  >();
  for (const ranking of input.candidate.rankings) {
    const entity = entityIdentity(ranking.item);
    uniqueItems.set(entity.id, { item: ranking.item, entity });
  }

  let changes = 0;

  try {
    await sql.begin(async (tx) => {
      await tx`
        insert into games (id, slug, name, publisher, status, current_version_id)
        values (
          ${gameId},
          'wow-forever',
          'World of Warcraft: Forever',
          'Blizzard Entertainment',
          'active',
          ${versionId}
        )
        on conflict (id) do update set
          slug = excluded.slug,
          name = excluded.name,
          publisher = excluded.publisher,
          status = excluded.status,
          current_version_id = excluded.current_version_id,
          updated_at = now()
      `;

      await tx`
        insert into game_versions (
          id, game_id, version, build, level_cap, status, valid_from, notes
        )
        values (
          ${versionId},
          ${gameId},
          'Beta 2026-10-08',
          null,
          30,
          'current',
          '2026-10-08T00:00:00Z',
          ${"Official Blizzard beta context: level cap 30; Oct. 8 beta build. Numeric client build is intentionally not asserted because Blizzard's official notes do not publish it. " + BLIZZARD_NOTES_URL}
        )
        on conflict (id) do update set
          version = excluded.version,
          build = excluded.build,
          level_cap = excluded.level_cap,
          status = excluded.status,
          valid_from = excluded.valid_from,
          notes = excluded.notes
      `;

      for (const context of contexts) {
        await tx`
          insert into ranking_contexts (
            id, game_id, slug, mode, role, level_cap, label, status
          )
          values (
            ${context.id}, ${gameId}, ${context.slug}, ${context.mode},
            ${context.role}, ${context.levelCap}, ${context.label}, 'active'
          )
          on conflict (id) do update set
            slug = excluded.slug,
            mode = excluded.mode,
            role = excluded.role,
            level_cap = excluded.level_cap,
            label = excluded.label,
            status = excluded.status
        `;
      }

      for (const { entity } of uniqueItems.values()) {
        await tx`
          insert into entities (
            id, game_id, parent_entity_id, entity_type, slug, name, role, status, sort_order
          )
          values (
            ${entity.id}, ${gameId}, null, 'spec', ${entity.slug}, ${entity.name},
            ${entity.role}, 'active', 0
          )
          on conflict (id) do update set
            slug = excluded.slug,
            name = excluded.name,
            role = excluded.role,
            status = excluded.status
        `;
      }

      await tx`
        insert into sources (
          id, name, url, source_type, publisher, published_at, updated_at_source,
          checked_at, freshness_status, notes
        )
        values (
          ${sourceId},
          'TierListBase Data Ranking · Forever Logs',
          ${FOREVER_LOGS_SOURCE_URL},
          'data',
          'TierListBase (data: Forever Logs)',
          ${input.candidate.retrievedAt},
          ${input.candidate.retrievedAt},
          ${input.candidate.retrievedAt},
          'current',
          ${"TierListBase-derived categorical ranking from Forever Logs aggregate statistics. The S/A/B/C label is TierListBase's calculation, not a tier supplied by Forever Logs."}
        )
        on conflict (id) do update set
          name = excluded.name,
          url = excluded.url,
          source_type = excluded.source_type,
          publisher = excluded.publisher,
          published_at = excluded.published_at,
          updated_at_source = excluded.updated_at_source,
          checked_at = excluded.checked_at,
          freshness_status = excluded.freshness_status,
          notes = excluded.notes
      `;

      const previous = await tx`
        select entity_id, ranking_context_id, tier
        from ratings
        where game_version_id = ${versionId}
          and ranking_context_id = any(${contextIds})
      `;
      const previousByKey = new Map(
        previous.map((row) => [`${row.entity_id}::${row.ranking_context_id}`, String(row.tier)]),
      );

      await tx`
        delete from source_ratings
        where source_id = ${sourceId}
          and game_version_id = ${versionId}
          and ranking_context_id = any(${contextIds})
      `;
      await tx`
        delete from ratings
        where game_version_id = ${versionId}
          and ranking_context_id = any(${contextIds})
      `;

      for (const ranking of input.candidate.rankings) {
        const context = contextForRole(ranking.item.role);
        const entity = entityIdentity(ranking.item);
        const score =
          ranking.item.weightedMedianScore === null
            ? null
            : ranking.item.weightedMedianScore.toFixed(2);
        const notes = observationNotes(ranking.item, input.candidate.retrievedAt);

        await tx`
          insert into source_ratings (
            id, source_id, entity_id, ranking_context_id, game_version_id,
            raw_tier, raw_rank, raw_score, normalized_score, normalized_tier,
            sample_size, collected_at, notes
          )
          values (
            ${stableId("r-", sourceId, entity.id, context.id, versionId)},
            ${sourceId},
            ${entity.id},
            ${context.id},
            ${versionId},
            ${ranking.tier.tier},
            ${ranking.rank},
            ${score},
            ${score},
            ${ranking.tier.tier},
            ${ranking.item.sampleCount},
            ${input.candidate.retrievedAt},
            ${notes}
          )
        `;

        await tx`
          insert into ratings (
            id, entity_id, ranking_context_id, game_version_id, tier,
            consensus_score, source_count, agreeing_source_count, disagreement_level,
            data_status, freshness_status, why_this_tier, strengths, constraints,
            published_at, updated_at
          )
          values (
            ${stableId("t-", entity.id, context.id, versionId)},
            ${entity.id},
            ${context.id},
            ${versionId},
            ${ranking.tier.tier},
            ${score},
            1,
            1,
            'unconfigured',
            ${ranking.tier.dataStatus},
            ${ranking.tier.freshnessStatus},
            ${explanation(ranking.item, ranking.tier)},
            ${ranking.item.weightedMedianScore === null ? null : `Observed relative data score: ${ranking.item.weightedMedianScore.toFixed(1)}.`},
            ${constraints(ranking.item, ranking.tier)},
            ${input.candidate.retrievedAt},
            ${input.candidate.retrievedAt}
          )
        `;

        const oldTier = previousByKey.get(`${entity.id}::${context.id}`);
        if (oldTier && oldTier !== ranking.tier.tier) {
          changes += 1;
          await tx`
            insert into rating_changes (
              id, entity_id, ranking_context_id, from_version_id, to_version_id,
              previous_tier, new_tier, change_type, reason, evidence, changed_at
            )
            values (
              ${stableId(
                "h-",
                entity.id,
                context.id,
                versionId,
                oldTier,
                ranking.tier.tier,
                input.candidate.retrievedAt.toISOString(),
              )},
              ${entity.id},
              ${context.id},
              ${versionId},
              ${versionId},
              ${oldTier},
              ${ranking.tier.tier},
              'reclassified',
              'Forever Logs current near-cap dungeon data changed the TierListBase data tier.',
              ${notes},
              ${input.candidate.retrievedAt}
            )
          `;
        }
      }
    });
  } finally {
    await sql.end({ timeout: 5 });
  }

  return {
    gameId,
    versionId,
    contexts: contexts.length,
    entities: uniqueItems.size,
    sourceRatings: input.candidate.rankings.length,
    ratings: input.candidate.rankings.length,
    changes,
  };
}
