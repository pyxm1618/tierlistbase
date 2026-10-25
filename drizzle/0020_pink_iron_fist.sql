ALTER TABLE "vanguard_reports" ADD COLUMN "operation_id" uuid;--> statement-breakpoint
ALTER TABLE "vanguard_reports" ADD COLUMN "payload_hash" text;--> statement-breakpoint
ALTER TABLE "vanguard_reports" ADD COLUMN "notification_started_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vanguard_reports" ADD COLUMN "notified_at" timestamp with time zone;--> statement-breakpoint
ALTER TABLE "vanguard_reports" ADD CONSTRAINT "vanguard_reports_operation_id_unique" UNIQUE("operation_id");