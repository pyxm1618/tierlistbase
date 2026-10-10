import { integer, numeric, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

export const games = pgTable("games", {
  id: varchar("id", { length: 36 }).primaryKey(),
  slug: varchar("slug", { length: 64 }).notNull().unique(),
  name: text("name").notNull(),
  publisher: text("publisher").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  currentVersionId: varchar("current_version_id", { length: 36 }),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const gameVersions = pgTable("game_versions", {
  id: varchar("id", { length: 36 }).primaryKey(),
  gameId: varchar("game_id", { length: 36 })
    .notNull()
    .references(() => games.id),
  version: varchar("version", { length: 64 }).notNull(),
  build: varchar("build", { length: 64 }),
  levelCap: integer("level_cap"),
  status: varchar("status", { length: 32 }).notNull().default("current"),
  releaseDate: timestamp("release_date", { withTimezone: true, mode: "date" }),
  validFrom: timestamp("valid_from", { withTimezone: true, mode: "date" }),
  validTo: timestamp("valid_to", { withTimezone: true, mode: "date" }),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const entities = pgTable("entities", {
  id: varchar("id", { length: 36 }).primaryKey(),
  gameId: varchar("game_id", { length: 36 })
    .notNull()
    .references(() => games.id),
  parentEntityId: varchar("parent_entity_id", { length: 36 }),
  entityType: varchar("entity_type", { length: 32 }).notNull(),
  slug: varchar("slug", { length: 64 }).notNull(),
  name: text("name").notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  status: varchar("status", { length: 32 }).notNull().default("active"),
  sortOrder: integer("sort_order").notNull().default(0),
});

export const rankingContexts = pgTable("ranking_contexts", {
  id: varchar("id", { length: 36 }).primaryKey(),
  gameId: varchar("game_id", { length: 36 })
    .notNull()
    .references(() => games.id),
  slug: varchar("slug", { length: 64 }).notNull(),
  mode: varchar("mode", { length: 32 }).notNull(),
  role: varchar("role", { length: 32 }).notNull(),
  levelCap: integer("level_cap"),
  label: text("label").notNull(),
  status: varchar("status", { length: 32 }).notNull().default("active"),
});

export const sources = pgTable("sources", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: text("name").notNull(),
  url: text("url").notNull(),
  sourceType: varchar("source_type", { length: 32 }).notNull(),
  publisher: text("publisher").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" }),
  updatedAtSource: timestamp("updated_at_source", { withTimezone: true, mode: "date" }),
  checkedAt: timestamp("checked_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
  freshnessStatus: varchar("freshness_status", { length: 32 }).notNull().default("current"),
  notes: text("notes"),
});

export const sourceRatings = pgTable("source_ratings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  sourceId: varchar("source_id", { length: 36 })
    .notNull()
    .references(() => sources.id),
  entityId: varchar("entity_id", { length: 36 })
    .notNull()
    .references(() => entities.id),
  rankingContextId: varchar("ranking_context_id", { length: 36 })
    .notNull()
    .references(() => rankingContexts.id),
  gameVersionId: varchar("game_version_id", { length: 36 })
    .notNull()
    .references(() => gameVersions.id),
  rawTier: varchar("raw_tier", { length: 32 }).notNull(),
  rawRank: integer("raw_rank"),
  rawScore: numeric("raw_score", { precision: 10, scale: 2 }),
  normalizedScore: numeric("normalized_score", { precision: 10, scale: 2 }),
  normalizedTier: varchar("normalized_tier", { length: 32 }),
  sampleSize: integer("sample_size"),
  collectedAt: timestamp("collected_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  notes: text("notes"),
});

export const ratings = pgTable("ratings", {
  id: varchar("id", { length: 36 }).primaryKey(),
  entityId: varchar("entity_id", { length: 36 })
    .notNull()
    .references(() => entities.id),
  rankingContextId: varchar("ranking_context_id", { length: 36 })
    .notNull()
    .references(() => rankingContexts.id),
  gameVersionId: varchar("game_version_id", { length: 36 })
    .notNull()
    .references(() => gameVersions.id),
  tier: varchar("tier", { length: 32 }).notNull(),
  consensusScore: numeric("consensus_score", { precision: 10, scale: 2 }),
  sourceCount: integer("source_count").notNull().default(0),
  agreeingSourceCount: integer("agreeing_source_count").notNull().default(0),
  disagreementLevel: varchar("disagreement_level", { length: 32 }).notNull().default("none"),
  dataStatus: varchar("data_status", { length: 32 }).notNull().default("unavailable"),
  freshnessStatus: varchar("freshness_status", { length: 32 }).notNull().default("current"),
  whyThisTier: text("why_this_tier"),
  strengths: text("strengths"),
  constraints: text("constraints"),
  publishedAt: timestamp("published_at", { withTimezone: true, mode: "date" })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export const ratingChanges = pgTable("rating_changes", {
  id: varchar("id", { length: 36 }).primaryKey(),
  entityId: varchar("entity_id", { length: 36 })
    .notNull()
    .references(() => entities.id),
  rankingContextId: varchar("ranking_context_id", { length: 36 })
    .notNull()
    .references(() => rankingContexts.id),
  fromVersionId: varchar("from_version_id", { length: 36 }).references(() => gameVersions.id),
  toVersionId: varchar("to_version_id", { length: 36 })
    .notNull()
    .references(() => gameVersions.id),
  previousTier: varchar("previous_tier", { length: 32 }).notNull(),
  newTier: varchar("new_tier", { length: 32 }).notNull(),
  changeType: varchar("change_type", { length: 32 }).notNull(),
  reason: text("reason"),
  evidence: text("evidence"),
  changedAt: timestamp("changed_at", { withTimezone: true, mode: "date" }).defaultNow().notNull(),
});

export type Game = typeof games.$inferSelect;
export type GameVersion = typeof gameVersions.$inferSelect;
export type Entity = typeof entities.$inferSelect;
export type RankingContext = typeof rankingContexts.$inferSelect;
export type Source = typeof sources.$inferSelect;
export type SourceRating = typeof sourceRatings.$inferSelect;
export type Rating = typeof ratings.$inferSelect;
export type RatingChange = typeof ratingChanges.$inferSelect;
