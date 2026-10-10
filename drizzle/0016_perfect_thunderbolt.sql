CREATE TABLE "entities" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"game_id" varchar(36) NOT NULL,
	"parent_entity_id" varchar(36),
	"entity_type" varchar(32) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"role" varchar(32) NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "game_versions" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"game_id" varchar(36) NOT NULL,
	"version" varchar(64) NOT NULL,
	"build" varchar(64),
	"level_cap" integer,
	"status" varchar(32) DEFAULT 'current' NOT NULL,
	"release_date" timestamp with time zone,
	"valid_from" timestamp with time zone,
	"valid_to" timestamp with time zone,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "games" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"slug" varchar(64) NOT NULL,
	"name" text NOT NULL,
	"publisher" text NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL,
	"current_version_id" varchar(36),
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "games_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "ranking_contexts" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"game_id" varchar(36) NOT NULL,
	"slug" varchar(64) NOT NULL,
	"mode" varchar(32) NOT NULL,
	"role" varchar(32) NOT NULL,
	"level_cap" integer,
	"label" text NOT NULL,
	"status" varchar(32) DEFAULT 'active' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "rating_changes" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"ranking_context_id" varchar(36) NOT NULL,
	"from_version_id" varchar(36),
	"to_version_id" varchar(36) NOT NULL,
	"previous_tier" varchar(32) NOT NULL,
	"new_tier" varchar(32) NOT NULL,
	"change_type" varchar(32) NOT NULL,
	"reason" text,
	"evidence" text,
	"changed_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "ratings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"ranking_context_id" varchar(36) NOT NULL,
	"game_version_id" varchar(36) NOT NULL,
	"tier" varchar(32) NOT NULL,
	"consensus_score" numeric(10, 2),
	"source_count" integer DEFAULT 0 NOT NULL,
	"agreeing_source_count" integer DEFAULT 0 NOT NULL,
	"disagreement_level" varchar(32) DEFAULT 'none' NOT NULL,
	"data_status" varchar(32) DEFAULT 'unavailable' NOT NULL,
	"freshness_status" varchar(32) DEFAULT 'current' NOT NULL,
	"why_this_tier" text,
	"strengths" text,
	"constraints" text,
	"published_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "source_ratings" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"source_id" varchar(36) NOT NULL,
	"entity_id" varchar(36) NOT NULL,
	"ranking_context_id" varchar(36) NOT NULL,
	"game_version_id" varchar(36) NOT NULL,
	"raw_tier" varchar(32) NOT NULL,
	"raw_rank" integer,
	"raw_score" numeric(10, 2),
	"normalized_score" numeric(10, 2),
	"normalized_tier" varchar(32),
	"sample_size" integer,
	"collected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "sources" (
	"id" varchar(36) PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"url" text NOT NULL,
	"source_type" varchar(32) NOT NULL,
	"publisher" text NOT NULL,
	"published_at" timestamp with time zone,
	"updated_at_source" timestamp with time zone,
	"checked_at" timestamp with time zone DEFAULT now() NOT NULL,
	"freshness_status" varchar(32) DEFAULT 'current' NOT NULL,
	"notes" text
);
--> statement-breakpoint
ALTER TABLE "entities" ADD CONSTRAINT "entities_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "game_versions" ADD CONSTRAINT "game_versions_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ranking_contexts" ADD CONSTRAINT "ranking_contexts_game_id_games_id_fk" FOREIGN KEY ("game_id") REFERENCES "public"."games"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_changes" ADD CONSTRAINT "rating_changes_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_changes" ADD CONSTRAINT "rating_changes_ranking_context_id_ranking_contexts_id_fk" FOREIGN KEY ("ranking_context_id") REFERENCES "public"."ranking_contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_changes" ADD CONSTRAINT "rating_changes_from_version_id_game_versions_id_fk" FOREIGN KEY ("from_version_id") REFERENCES "public"."game_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "rating_changes" ADD CONSTRAINT "rating_changes_to_version_id_game_versions_id_fk" FOREIGN KEY ("to_version_id") REFERENCES "public"."game_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_ranking_context_id_ranking_contexts_id_fk" FOREIGN KEY ("ranking_context_id") REFERENCES "public"."ranking_contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ratings" ADD CONSTRAINT "ratings_game_version_id_game_versions_id_fk" FOREIGN KEY ("game_version_id") REFERENCES "public"."game_versions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_ratings" ADD CONSTRAINT "source_ratings_source_id_sources_id_fk" FOREIGN KEY ("source_id") REFERENCES "public"."sources"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_ratings" ADD CONSTRAINT "source_ratings_entity_id_entities_id_fk" FOREIGN KEY ("entity_id") REFERENCES "public"."entities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_ratings" ADD CONSTRAINT "source_ratings_ranking_context_id_ranking_contexts_id_fk" FOREIGN KEY ("ranking_context_id") REFERENCES "public"."ranking_contexts"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "source_ratings" ADD CONSTRAINT "source_ratings_game_version_id_game_versions_id_fk" FOREIGN KEY ("game_version_id") REFERENCES "public"."game_versions"("id") ON DELETE no action ON UPDATE no action;