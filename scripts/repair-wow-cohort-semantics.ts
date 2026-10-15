import postgres from "postgres";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("Missing DATABASE_URL");
}

const isApply = process.argv.includes("--apply") || process.env.APPLY === "true";

async function main() {
  const sql = postgres(DATABASE_URL!, { max: 1, prepare: false });

  try {
    console.log(
      `[repair-wow-cohort-semantics] Mode: ${isApply ? "APPLY (writes will be committed)" : "DRY-RUN (read-only audit, rollback)"}`,
    );

    await sql.begin(async (tx) => {
      // 1. Audit existing records
      const targetSlugs = [
        "gladiator-warrior",
        "justicar-paladin",
        "warrior-gladiator",
        "paladin-justicar",
      ];
      const existingEntities = await tx`
        select
          e.id,
          e.game_id,
          e.parent_entity_id,
          e.entity_type,
          e.slug,
          e.name,
          e.role,
          ep.metadata
        from entities e
        join games g on g.id = e.game_id
        left join entity_profiles ep on ep.entity_id = e.id
        where g.slug = 'wow-forever'
          and (
            e.slug = any(${targetSlugs})
            or e.name in ('Gladiator Warrior', 'Justicar Paladin')
          )
      `;

      console.log(`Found ${existingEntities.length} matching entities in wow-forever.`);

      if (existingEntities.length === 0) {
        console.log(
          "No existing Gladiator / Justicar entities found in database. Nothing to repair.",
        );
        return;
      }

      for (const entity of existingEntities) {
        console.log(`\n--- Before Repair: Entity ${entity.id} (${entity.name}) ---`);
        console.log(`  entity_type: ${entity.entity_type}`);
        console.log(`  slug: ${entity.slug}`);
        console.log(`  metadata:`, entity.metadata);
      }

      // 2. Perform in-place update
      const targetIds = existingEntities.map((e) => e.id);
      const updatedEntities = await tx`
        update entities
        set entity_type = 'cohort'
        where id = any(${targetIds})
        returning id, name, slug, entity_type
      `;

      for (const updated of updatedEntities) {
        const patch = {
          officialSpec: false,
          entityKind: "forever_logs_cohort",
        };

        await tx`
          update entity_profiles
          set metadata = (case when jsonb_typeof(metadata) = 'string'
            then (metadata #>> '{}')::jsonb
            else metadata end) || ${tx.json(patch)}::jsonb
          where entity_id = ${updated.id}
        `;
      }

      // 3. Audit after repair
      const auditedEntities = await tx`
        select
          e.id,
          e.game_id,
          e.parent_entity_id,
          e.entity_type,
          e.slug,
          e.name,
          e.role,
          ep.metadata
        from entities e
        left join entity_profiles ep on ep.entity_id = e.id
        where e.id = any(${updatedEntities.map((u) => u.id)})
      `;

      for (const entity of auditedEntities) {
        console.log(`\n--- After Repair: Entity ${entity.id} (${entity.name}) ---`);
        console.log(`  entity_type: ${entity.entity_type}`);
        console.log(`  slug: ${entity.slug}`);
        console.log(`  metadata:`, entity.metadata);
      }

      if (!isApply) {
        console.log("\n[DRY-RUN] Rolling back transaction. No changes saved.");
        throw new Error("DRY_RUN_ROLLBACK");
      } else {
        console.log("\n[APPLY] Transaction committed successfully.");
      }
    });
  } catch (err: unknown) {
    if (err instanceof Error && err.message === "DRY_RUN_ROLLBACK") {
      // expected for dry-run
    } else {
      throw err;
    }
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
