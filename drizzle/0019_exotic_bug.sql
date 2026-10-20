CREATE TABLE "vanguard_event_state" (
	"id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
	"wow_claimed_count" integer DEFAULT 0 NOT NULL,
	"wow_completed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vanguard_event_singleton" CHECK ("vanguard_event_state"."id" = 1),
	CONSTRAINT "vanguard_wow_count" CHECK ("vanguard_event_state"."wow_claimed_count" between 0 and 8016),
	CONSTRAINT "vanguard_completion_consistent" CHECK (("vanguard_event_state"."wow_claimed_count" = 8016) = ("vanguard_event_state"."wow_completed_at" is not null))
);
--> statement-breakpoint
CREATE TABLE "vanguard_inscriptions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text,
	"seat_id" text NOT NULL,
	"phase" text NOT NULL,
	"letter" text NOT NULL,
	"local_index" integer NOT NULL,
	"display_name" text NOT NULL,
	"faction" text NOT NULL,
	"class_name" text NOT NULL,
	"guild_name" text,
	"guild_key" text,
	"battle_cry" text,
	"media_id" uuid,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vanguard_inscriptions_seat_id_unique" UNIQUE("seat_id"),
	CONSTRAINT "vanguard_inscription_status" CHECK ("vanguard_inscriptions"."status" in ('active','hidden','deleted')),
	CONSTRAINT "vanguard_faction" CHECK ("vanguard_inscriptions"."faction" in ('alliance','horde')),
	CONSTRAINT "vanguard_seat_identity" CHECK ((( "vanguard_inscriptions"."phase" = 'wow' and "vanguard_inscriptions"."letter" in ('W1','O','W2') and "vanguard_inscriptions"."local_index" between 1 and 2672) or ("vanguard_inscriptions"."phase" = 'forever' and "vanguard_inscriptions"."letter" in ('F','O','R1','E1','V','E2','R2') and "vanguard_inscriptions"."local_index" between 1 and 8016)) and "vanguard_inscriptions"."seat_id" = upper("vanguard_inscriptions"."phase") || '-' || "vanguard_inscriptions"."letter" || '-' || lpad("vanguard_inscriptions"."local_index"::text, 4, '0'))
);
--> statement-breakpoint
CREATE TABLE "vanguard_media" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"owner_user_id" text,
	"private_master_key" text NOT NULL,
	"moderation_key" text NOT NULL,
	"public_detail_key" text,
	"public_wow_thumb_key" text,
	"public_forever_thumb_key" text,
	"mime" text NOT NULL,
	"width" integer,
	"height" integer,
	"byte_size" integer,
	"sha256" text,
	"moderation_status" text DEFAULT 'pending' NOT NULL,
	"moderation_model" text DEFAULT '@cf/cloudflare/clef-flash' NOT NULL,
	"moderation_result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"moderated_at" timestamp with time zone,
	CONSTRAINT "vanguard_media_status" CHECK ("vanguard_media"."moderation_status" in ('pending','approved','rejected','hidden'))
);
--> statement-breakpoint
CREATE TABLE "vanguard_reports" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"inscription_id" uuid NOT NULL,
	"reporter_user_id" text,
	"reason" text NOT NULL,
	"status" text DEFAULT 'new' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "vanguard_report_reason" CHECK ("vanguard_reports"."reason" in ('sexual_graphic','hate_impersonation','privacy','spam_promotion','other')),
	CONSTRAINT "vanguard_report_status" CHECK ("vanguard_reports"."status" in ('new','reviewed','actioned','dismissed'))
);
--> statement-breakpoint
CREATE TABLE "vanguard_seat_holds" (
	"seat_id" text PRIMARY KEY NOT NULL,
	"hold_token_hash" text NOT NULL,
	"user_id" text,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "vanguard_inscriptions" ADD CONSTRAINT "vanguard_inscriptions_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vanguard_inscriptions" ADD CONSTRAINT "vanguard_inscriptions_media_id_vanguard_media_id_fk" FOREIGN KEY ("media_id") REFERENCES "public"."vanguard_media"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vanguard_media" ADD CONSTRAINT "vanguard_media_owner_user_id_user_id_fk" FOREIGN KEY ("owner_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vanguard_reports" ADD CONSTRAINT "vanguard_reports_inscription_id_vanguard_inscriptions_id_fk" FOREIGN KEY ("inscription_id") REFERENCES "public"."vanguard_inscriptions"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vanguard_reports" ADD CONSTRAINT "vanguard_reports_reporter_user_id_user_id_fk" FOREIGN KEY ("reporter_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vanguard_seat_holds" ADD CONSTRAINT "vanguard_seat_holds_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "vanguard_account_one_seat" ON "vanguard_inscriptions" USING btree ("user_id") WHERE "vanguard_inscriptions"."user_id" is not null;--> statement-breakpoint
CREATE UNIQUE INDEX "vanguard_media_one_inscription" ON "vanguard_inscriptions" USING btree ("media_id") WHERE "vanguard_inscriptions"."media_id" is not null;--> statement-breakpoint
CREATE INDEX "vanguard_name_search_idx" ON "vanguard_inscriptions" USING btree (lower("display_name") text_pattern_ops);--> statement-breakpoint
CREATE INDEX "vanguard_guild_search_idx" ON "vanguard_inscriptions" USING btree ("guild_key" text_pattern_ops);--> statement-breakpoint
CREATE INDEX "vanguard_media_owner_idx" ON "vanguard_media" USING btree ("owner_user_id");