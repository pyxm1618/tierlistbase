import postgres from "postgres";
import {
  evidenceIdentity,
  stableEditorialId,
  validateReviewedPackage,
  type ReviewedPackage,
} from "./editorial-package";

type Executor = postgres.Sql | postgres.TransactionSql;
type Row = Record<string, string | number | null>;
type Plan = { gameId: string; versionId: string; contextId: string; rows: Record<string, Row[]> };
const tables = [
  "games",
  "game_versions",
  "ranking_contexts",
  "entities",
  "entity_profiles",
  "sources",
  "ratings",
  "evidence_observations",
] as const;

// Natural-key checks also reject legacy duplicates instead of selecting an arbitrary row.
async function findRow(sql: Executor, table: string, key: Row) {
  const clauses = Object.entries(key).map(
    ([column, value]) => sql`${sql(column)} is not distinct from ${value}`,
  );
  const where = clauses.reduce((left, right) => sql`${left} and ${right}`);
  const rows = await sql<Record<string, unknown>[]>`select * from ${sql(table)} where ${where}`;
  if (rows.length > 1) throw new Error(`Ambiguous ${table} relation: ${JSON.stringify(key)}`);
  return rows[0];
}

function normalized(value: unknown): unknown {
  if (Object.prototype.toString.call(value) === "[object Date]")
    return (value as Date).toISOString();
  if (Array.isArray(value)) return value.map(normalized);
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([key, item]) => [key, normalized(item)]),
    );
  }
  return value;
}

function assertRow(actual: Record<string, unknown>, expected: Row, table: string) {
  for (const [column, value] of Object.entries(expected)) {
    let wanted: unknown = value;
    let found: unknown = actual[column];
    if (column === "metadata" && typeof value === "string") {
      wanted = JSON.parse(value);
      if (typeof found === "string") found = JSON.parse(found);
    }
    if (column === "numeric_value" && found !== null) found = Number(found);
    if (
      ["release_date", "checked_at", "observed_at"].includes(column) &&
      typeof found === "string"
    ) {
      found = new Date(found).toISOString();
    }
    if (JSON.stringify(normalized(found)) !== JSON.stringify(normalized(wanted))) {
      throw new Error(
        `Snapshot mismatch/conflict in ${table}.${column}, id=${expected.id ?? expected.entity_id}, expected=${JSON.stringify(normalized(wanted))}, found=${JSON.stringify(normalized(found))}`,
      );
    }
  }
}

async function resolveId(sql: Executor, table: string, key: Row, kind: string, identity: string) {
  const existing = await findRow(sql, table, key);
  return existing ? String(existing.id) : stableEditorialId(kind, identity);
}

async function buildPlan(sql: Executor, pkg: ReviewedPackage): Promise<Plan> {
  const gameId = await resolveId(
    sql,
    "games",
    { slug: pkg.manifest.game },
    "game",
    pkg.manifest.game,
  );
  const versionId = await resolveId(
    sql,
    "game_versions",
    { game_id: gameId, version: "7.1" },
    "version",
    gameId + ":7.1",
  );
  const contextId = await resolveId(
    sql,
    "ranking_contexts",
    { game_id: gameId, slug: "endgame-overall" },
    "context",
    gameId + ":endgame-overall",
  );
  const rows: Record<string, Row[]> = Object.fromEntries(tables.map((table) => [table, []]));
  rows.games!.push({
    id: gameId,
    slug: pkg.manifest.game,
    name: "Genshin Impact",
    publisher: "HoYoverse",
    status: "active",
    current_version_id: versionId,
  });
  rows.game_versions!.push({
    id: versionId,
    game_id: gameId,
    version: "7.1",
    status: "current",
    release_date: "2026-09-23T00:00:00.000Z",
  });
  rows.ranking_contexts!.push({
    id: contextId,
    game_id: gameId,
    slug: "endgame-overall",
    mode: "endgame",
    role: "overall",
    label: "Genshin Impact · Current Version · Endgame Overall",
    status: "active",
  });
  const entityIds = new Map<string, string>();
  for (const character of pkg.characters) {
    const entityId = await resolveId(
      sql,
      "entities",
      { game_id: gameId, slug: character.slug },
      "entity",
      gameId + ":" + character.slug,
    );
    entityIds.set(character.slug, entityId);
    rows.entities!.push({
      id: entityId,
      game_id: gameId,
      entity_type: character.entityType,
      slug: character.slug,
      name: character.name,
      role: "unclassified",
      status: character.status,
    });
    rows.entity_profiles!.push({
      entity_id: entityId,
      metadata: JSON.stringify({
        element: character.element,
        weapon: character.weapon,
        rarity: character.rarity,
        officialReleaseVersion: character.officialReleaseVersion,
        officialUrl: character.officialUrl,
      }),
    });
  }
  const sourceIds = new Map<string, string>();
  for (const source of pkg.sources) {
    const sourceId = await resolveId(sql, "sources", { url: source.baseUrl }, "source", source.key);
    sourceIds.set(source.key, sourceId);
    rows.sources!.push({
      id: sourceId,
      name: source.name,
      url: source.baseUrl,
      source_type: source.sourceType,
      publisher: source.publisher,
    });
  }
  for (const rating of pkg.ratings) {
    const entityId = entityIds.get(rating.entitySlug)!;
    const id = await resolveId(
      sql,
      "ratings",
      { entity_id: entityId, game_version_id: versionId, ranking_context_id: contextId },
      "rating",
      JSON.stringify([entityId, versionId, contextId]),
    );
    rows.ratings!.push({
      id,
      entity_id: entityId,
      game_version_id: versionId,
      ranking_context_id: contextId,
      tier: rating.tier,
      primary_role: rating.primaryRole,
      why_this_tier: rating.whyThisTier,
      strengths: JSON.stringify(rating.strengths),
      constraints: JSON.stringify(rating.limitations),
      best_use_context: rating.bestUseContext,
      ranking_assumption: rating.rankingAssumption,
      evidence_summary: rating.evidenceSummary,
      editorial_status: rating.editorialStatus,
      published_at: null,
    });
  }
  for (const evidence of pkg.evidence) {
    rows.evidence_observations!.push({
      id: stableEditorialId("evidence", evidenceIdentity(evidence)),
      entity_id: entityIds.get(evidence.entitySlug)!,
      source_id: sourceIds.get(evidence.sourceKey)!,
      game_version_id: versionId,
      ranking_context_id: contextId,
      observation_type: evidence.observationType,
      metric_key: evidence.metricKey,
      numeric_value: evidence.numericValue,
      text_value: evidence.textValue,
      unit: evidence.unit,
      sample_size: evidence.sampleSize,
      source_url: evidence.sourceUrl,
      observed_at: null,
      checked_at: evidence.checkedAt + "T00:00:00.000Z",
      status: evidence.status,
      notes: evidence.notes,
    });
  }
  return { gameId, versionId, contextId, rows };
}

async function verifyPlan(sql: Executor, pkg: ReviewedPackage, plan: Plan) {
  const invalidProfiles = await sql`select count(*)::int as count
    from entity_profiles p join entities e on e.id=p.entity_id
    where e.game_id=${plan.gameId} and jsonb_typeof(p.metadata)<>'object'`;
  if (invalidProfiles[0]?.count !== 0)
    throw new Error("Entity profile metadata must be a JSONB object");
  for (const table of tables) {
    for (const expected of plan.rows[table]!) {
      const key =
        table === "entity_profiles" ? { entity_id: expected.entity_id! } : { id: expected.id! };
      const actual = await findRow(sql, table, key);
      if (!actual) throw new Error(`Read-back missing relation: ${table} ${JSON.stringify(key)}`);
      assertRow(actual, expected, table);
    }
  }
  const [counts] = await sql`select
    (select count(*)::int from entities where game_id=${plan.gameId}) as entities,
    (select count(*)::int from entity_profiles p join entities e on e.id=p.entity_id where e.game_id=${plan.gameId}) as profiles,
    (select count(*)::int from ratings where game_version_id=${plan.versionId} and ranking_context_id=${plan.contextId}) as ratings,
    (select count(*)::int from evidence_observations where game_version_id=${plan.versionId} and ranking_context_id=${plan.contextId}) as evidence`;
  if (
    !counts ||
    counts.entities !== 121 ||
    counts.profiles !== 121 ||
    counts.ratings !== 121 ||
    counts.evidence !== pkg.evidence.length
  ) {
    throw new Error(`Read-back count mismatch: ${JSON.stringify(counts)}`);
  }
  const duplicates = await sql`select count(*)::int as count from (
    select slug from entities where game_id=${plan.gameId} group by slug having count(*)>1
    union all select entity_id from ratings where game_version_id=${plan.versionId} and ranking_context_id=${plan.contextId} group by entity_id having count(*)>1
    union all select entity_id from evidence_observations where game_version_id=${plan.versionId} and ranking_context_id=${plan.contextId}
      group by entity_id, source_id, observation_type, metric_key, source_url, checked_at having count(*)>1
  ) duplicates`;
  const missing = await sql`select count(*)::int as count from (
    select r.id from ratings r left join entities e on e.id=r.entity_id left join game_versions v on v.id=r.game_version_id left join ranking_contexts c on c.id=r.ranking_context_id
      where (r.game_version_id=${plan.versionId} or e.game_id=${plan.gameId}) and (e.id is null or v.id is null or c.id is null or e.game_id<>v.game_id or e.game_id<>c.game_id)
    union all select o.id from evidence_observations o left join entities e on e.id=o.entity_id left join sources s on s.id=o.source_id left join game_versions v on v.id=o.game_version_id left join ranking_contexts c on c.id=o.ranking_context_id
      where (o.game_version_id=${plan.versionId} or e.game_id=${plan.gameId}) and (e.id is null or s.id is null or v.id is null or e.game_id<>v.game_id or (o.ranking_context_id is not null and (c.id is null or e.game_id<>c.game_id)))
  ) missing`;
  if (duplicates[0]?.count !== 0 || missing[0]?.count !== 0)
    throw new Error("Read-back duplicate or missing relation");
  return {
    gameId: plan.gameId,
    entities: counts.entities as number,
    profiles: counts.profiles as number,
    ratings: counts.ratings as number,
    evidenceObservations: counts.evidence as number,
    sources: pkg.sources.length,
    currentVersion: "7.1",
    rankingContext: "endgame-overall",
    duplicateCount: 0,
    missingRelationCount: 0,
    fieldComparison: "PASS",
  };
}

export async function importReviewedPackage(sql: postgres.Sql, input: unknown) {
  const pkg = validateReviewedPackage(input);
  return sql.begin(async (tx) => {
    // Serialize importers and prevent concurrent writes between collision checks and inserts.
    await tx`select pg_advisory_xact_lock(713121)`;
    await tx`lock table games,game_versions,ranking_contexts,entities,entity_profiles,sources,ratings,evidence_observations in share row exclusive mode`;
    const plan = await buildPlan(tx, pkg);
    const inserted: Record<string, number> = {};
    for (const table of tables) {
      inserted[table] = 0;
      for (const row of plan.rows[table]!) {
        const key = table === "entity_profiles" ? { entity_id: row.entity_id! } : { id: row.id! };
        const existing = await findRow(tx, table, key);
        if (existing) {
          assertRow(existing, row, table);
          continue;
        }
        const inputRow = table === "sources" ? { ...row, freshness_status: "unknown" } : row;
        if (table === "entity_profiles") {
          await tx`insert into entity_profiles (entity_id,metadata) values (${row.entity_id!},${row.metadata!}::text::jsonb)`;
        } else {
          await tx`insert into ${tx(table)} ${tx(inputRow)}`;
        }
        inserted[table]++;
      }
    }
    const report = await verifyPlan(tx, pkg, plan);
    return { inserted, ...report };
  });
}

export async function readBackReviewedPackage(sql: postgres.Sql, input: unknown) {
  const pkg = validateReviewedPackage(input);
  return sql.begin("isolation level repeatable read read only", async (tx) => {
    const plan = await buildPlan(tx, pkg);
    return verifyPlan(tx, pkg, plan);
  });
}
