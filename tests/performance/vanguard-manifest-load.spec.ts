import { expect, test } from "@playwright/test";
import { sql } from "drizzle-orm";
import { createDatabaseClient } from "@/platform/database/client";
import {
  createVanguardService,
  vanguardEventState,
  vanguardInscriptions,
} from "@/modules/wow-vanguard";
import { assertSafeTestDatabaseUrl } from "../support/test-database-guard";

const database = createDatabaseClient(assertSafeTestDatabaseUrl());
const service = createVanguardService(database.db);
const seatCounts = [0, 8016, 32000, 64128] as const;
const clientCounts = [100, 500, 1000] as const;
const pollWindowMs = 15_000;

function percentile(values: number[], pct: number) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil((pct / 100) * sorted.length) - 1)]!;
}

async function seedManifestRows(total: number) {
  await database.db.execute(sql`delete from vanguard_reports`);
  await database.db.execute(sql`delete from vanguard_inscriptions`);
  await database.db.execute(sql`delete from vanguard_event_state`);

  const wow = Math.min(total, 8016);
  if (wow > 0) {
    await database.db.execute(
      sql.raw(`
        insert into vanguard_inscriptions
          (seat_id, phase, letter, local_index, display_name, faction, class_name)
        select
          'WOW-' || letter || '-' || lpad(local_index::text, 4, '0'),
          'wow',
          letter,
          local_index,
          'Load ' || g,
          'alliance',
          'Mage'
        from (
          select
            g,
            case when g <= 2672 then 'W1' when g <= 5344 then 'O' else 'W2' end as letter,
            case
              when g <= 2672 then g
              when g <= 5344 then g - 2672
              else g - 5344
            end as local_index
          from generate_series(1, ${wow}) as g
        ) seats
      `),
    );
  }

  const forever = Math.max(0, total - 8016);
  if (forever > 0) {
    await database.db.execute(
      sql.raw(`
        insert into vanguard_inscriptions
          (seat_id, phase, letter, local_index, display_name, faction, class_name)
        select
          'FOREVER-' || letter || '-' || lpad(local_index::text, 4, '0'),
          'forever',
          letter,
          local_index,
          'Load Forever ' || g,
          'horde',
          'Mage'
        from (
          select
            g,
            case ceil(g / 8016.0)::integer
              when 1 then 'F'
              when 2 then 'O'
              when 3 then 'R1'
              when 4 then 'E1'
              when 5 then 'V'
              when 6 then 'E2'
              else 'R2'
            end as letter,
            ((g - 1) % 8016) + 1 as local_index
          from generate_series(1, ${forever}) as g
        ) seats
      `),
    );
  }

  await database.db.insert(vanguardEventState).values({
    id: 1,
    wowClaimedCount: wow,
    wowCompletedAt: wow === 8016 ? new Date("2026-10-19T00:00:00.000Z") : null,
  });
}

async function dbStats() {
  const [row] = await database.db.execute<{
    xact_commit: string | number;
    blks_read: string | number;
    blks_hit: string | number;
    tup_returned: string | number;
  }>(sql`
    select xact_commit, blks_read, blks_hit, tup_returned
    from pg_stat_database
    where datname = current_database()
  `);
  return {
    xactCommit: Number(row?.xact_commit ?? 0),
    blocksRead: Number(row?.blks_read ?? 0),
    blocksHit: Number(row?.blks_hit ?? 0),
    tuplesReturned: Number(row?.tup_returned ?? 0),
  };
}

async function runPollWindow(clients: number) {
  const latencies: number[] = [];
  let errors = 0;
  const cpuBefore = process.cpuUsage();
  const dbBefore = await dbStats();
  const wallStart = performance.now();

  await Promise.all(
    Array.from({ length: clients }, (_, index) => {
      const delay = Math.floor((index * pollWindowMs) / clients);
      return new Promise<void>((resolve) => {
        setTimeout(() => {
          const requestStart = performance.now();
          void service
            .manifest()
            .catch(() => {
              errors++;
            })
            .finally(() => {
              latencies.push(performance.now() - requestStart);
              resolve();
            });
        }, delay);
      });
    }),
  );

  const elapsedMs = performance.now() - wallStart;
  const cpu = process.cpuUsage(cpuBefore);
  const dbAfter = await dbStats();
  return {
    clients,
    pollWindowMs,
    p50: percentile(latencies, 50),
    p95: percentile(latencies, 95),
    p99: percentile(latencies, 99),
    requestsPerSecond: clients / (elapsedMs / 1000),
    errorRate: errors / clients,
    nodeCpuPercentOfOneCore: ((cpu.user + cpu.system) / 1000 / elapsedMs) * 100,
    dbDelta: {
      xactCommit: dbAfter.xactCommit - dbBefore.xactCommit,
      blocksRead: dbAfter.blocksRead - dbBefore.blocksRead,
      blocksHit: dbAfter.blocksHit - dbBefore.blocksHit,
      tuplesReturned: dbAfter.tuplesReturned - dbBefore.tuplesReturned,
    },
  };
}

test("Vanguard Manifest production-like polling load", async ({}, testInfo) => {
  test.skip(testInfo.project.name !== "desktop", "Run the database load profile once.");
  test.setTimeout(360_000);

  const results: unknown[] = [];
  for (const seatCount of seatCounts) {
    await seedManifestRows(seatCount);
    const dbStart = performance.now();
    await database.db.execute(sql`
      select seat_id, phase, local_index, letter
      from vanguard_inscriptions
    `);
    const dbQueryLatency = performance.now() - dbStart;

    for (const clients of clientCounts) {
      const metrics = await runPollWindow(clients);
      const result = { seatCount, dbQueryLatency, ...metrics };
      results.push(result);
      console.log("VANGUARD_MANIFEST_LOAD", JSON.stringify(result));
      expect(metrics.errorRate).toBe(0);
    }
  }

  await test.info().attach("vanguard-manifest-load-results", {
    body: JSON.stringify(results, null, 2),
    contentType: "application/json",
  });
});

test.afterAll(async () => {
  await database.close();
});
