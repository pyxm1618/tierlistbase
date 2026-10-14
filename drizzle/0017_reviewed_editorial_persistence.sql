CREATE TABLE "entity_profiles" (
	"entity_id" varchar(36) PRIMARY KEY NOT NULL,
	"metadata" jsonb NOT NULL
);
--> statement-breakpoint
CREATE TABLE "evidence_observations" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"source_id" varchar(36) NOT NULL,
	"game_version_id" varchar(36) NOT NULL,
	"ranking_context_id" varchar(36),
	"observation_type" varchar(64) NOT NULL,
	"metric_key" varchar(64),
	"numeric_value" numeric,
	"text_value" text,
	"unit" varchar(32),
	"sample_size" integer,
	"source_url" text NOT NULL,
	"observed_at" timestamp with time zone,
	"checked_at" timestamp with time zone NOT NULL,
	"status" varchar(32) NOT NULL,
	"notes" text,
	CONSTRAINT "evidence_value_check" CHECK ("evidence_observations"."numeric_value" is not null or "evidence_observations"."text_value" is not null),
	CONSTRAINT "evidence_sample_size_check" CHECK ("evidence_observations"."sample_size" is null or "evidence_observations"."sample_size" >= 0)
);
--> statement-breakpoint
ALTER TABLE "ratings" ALTER COLUMN "published_at" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "primary_role" varchar(32);--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "best_use_context" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "ranking_assumption" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "evidence_summary" text;--> statement-breakpoint
ALTER TABLE "ratings" ADD COLUMN "editorial_status" varchar(32) DEFAULT 'draft' NOT NULL;--> statement-breakpoint
ALTER TABLE "entity_profiles" ADD CONSTRAINT "entity_profiles_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_observations" ADD CONSTRAINT "evidence_observations_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_observations" ADD CONSTRAINT "evidence_observations_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_observations" ADD CONSTRAINT "evidence_observations_game_version_id_game_versions_id_fk" FOREIGN KEY ("game_version_id") REFERENCES "public"."game_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "evidence_observations" ADD CONSTRAINT "evidence_observations_ranking_context_id_ranking_contexts_id_fk" FOREIGN KEY ("ranking_context_id") REFERENCES "public"."ranking_contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_editorial_status_check" CHECK ("ratings"."editorial_status" in ('draft', 'reviewed', 'published'));