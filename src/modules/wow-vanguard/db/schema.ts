import { sql } from "drizzle-orm";
import {
  check,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "../../../platform/database/auth-schema";

const createdAt = () => timestamp("created_at", { withTimezone: true }).defaultNow().notNull();
export const vanguardEventState = pgTable(
  "vanguard_event_state",
  {
    id: integer("id").primaryKey().default(1),
    wowClaimedCount: integer("wow_claimed_count").default(0).notNull(),
    wowCompletedAt: timestamp("wow_completed_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (t) => [
    check("vanguard_event_singleton", sql`${t.id} = 1`),
    check("vanguard_wow_count", sql`${t.wowClaimedCount} between 0 and 8016`),
    check(
      "vanguard_completion_consistent",
      sql`(${t.wowClaimedCount} = 8016) = (${t.wowCompletedAt} is not null)`,
    ),
  ],
);
export const vanguardMedia = pgTable(
  "vanguard_media",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerUserId: text("owner_user_id").references(() => user.id, { onDelete: "set null" }),
    privateMasterKey: text("private_master_key").notNull(),
    moderationKey: text("moderation_key").notNull(),
    publicDetailKey: text("public_detail_key"),
    publicWowThumbKey: text("public_wow_thumb_key"),
    publicForeverThumbKey: text("public_forever_thumb_key"),
    mime: text("mime").notNull(),
    width: integer("width"),
    height: integer("height"),
    byteSize: integer("byte_size"),
    sha256: text("sha256"),
    moderationStatus: text("moderation_status").default("pending").notNull(),
    moderationModel: text("moderation_model").default("@cf/cloudflare/clef-flash").notNull(),
    moderationResult: jsonb("moderation_result"),
    createdAt: createdAt(),
    moderatedAt: timestamp("moderated_at", { withTimezone: true }),
  },
  (t) => [
    check(
      "vanguard_media_status",
      sql`${t.moderationStatus} in ('pending','approved','rejected','hidden')`,
    ),
    index("vanguard_media_owner_idx").on(t.ownerUserId),
  ],
);
export const vanguardInscriptions = pgTable(
  "vanguard_inscriptions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id").references(() => user.id, { onDelete: "set null" }),
    seatId: text("seat_id").notNull().unique(),
    phase: text("phase").notNull(),
    letter: text("letter").notNull(),
    localIndex: integer("local_index").notNull(),
    displayName: text("display_name").notNull(),
    faction: text("faction").notNull(),
    className: text("class_name").notNull(),
    guildName: text("guild_name"),
    guildKey: text("guild_key"),
    battleCry: text("battle_cry"),
    mediaId: uuid("media_id").references(() => vanguardMedia.id),
    status: text("status").default("active").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    uniqueIndex("vanguard_account_one_seat")
      .on(t.userId)
      .where(sql`${t.userId} is not null`),
    uniqueIndex("vanguard_media_one_inscription")
      .on(t.mediaId)
      .where(sql`${t.mediaId} is not null`),
    index("vanguard_name_search_idx").on(sql`lower(${t.displayName}) text_pattern_ops`),
    index("vanguard_guild_search_idx").on(sql`${t.guildKey} text_pattern_ops`),
    check("vanguard_inscription_status", sql`${t.status} in ('active','hidden','deleted')`),
    check("vanguard_faction", sql`${t.faction} in ('alliance','horde')`),
    check(
      "vanguard_seat_identity",
      sql`(( ${t.phase} = 'wow' and ${t.letter} in ('W1','O','W2') and ${t.localIndex} between 1 and 2672) or (${t.phase} = 'forever' and ${t.letter} in ('F','O','R1','E1','V','E2','R2') and ${t.localIndex} between 1 and 8016)) and ${t.seatId} = upper(${t.phase}) || '-' || ${t.letter} || '-' || lpad(${t.localIndex}::text, 4, '0')`,
    ),
  ],
);
export const vanguardSeatHolds = pgTable("vanguard_seat_holds", {
  seatId: text("seat_id").primaryKey(),
  holdTokenHash: text("hold_token_hash").notNull(),
  userId: text("user_id").references(() => user.id, { onDelete: "cascade" }),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
});
export const vanguardReports = pgTable(
  "vanguard_reports",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    inscriptionId: uuid("inscription_id")
      .notNull()
      .references(() => vanguardInscriptions.id),
    reporterUserId: text("reporter_user_id").references(() => user.id, { onDelete: "set null" }),
    reason: text("reason").notNull(),
    status: text("status").default("new").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    check(
      "vanguard_report_reason",
      sql`${t.reason} in ('sexual_graphic','hate_impersonation','privacy','spam_promotion','other')`,
    ),
    check("vanguard_report_status", sql`${t.status} in ('new','reviewed','actioned','dismissed')`),
  ],
);
