import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";

export const defaultPackageDirectory = path.resolve("data/editorial/genshin-impact/7.1");
const nonempty = z
  .string()
  .min(1)
  .refine((value) => value.trim().length > 0, "Nonempty text required");
const slug = nonempty.regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).max(64);
const url = z.url().refine((value) => new URL(value).protocol === "https:", "HTTPS required");
const date = z.iso.date().refine((value) => {
  const parsed = new Date(value + "T00:00:00Z");
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}, "Invalid calendar date");
const scope = { gameVersion: z.literal("7.1"), rankingContext: z.literal("endgame-overall") };
const packageSchema = z
  .object({
    manifest: z
      .object({
        game: z.literal("genshin-impact"),
        ...scope,
        characterCount: z.literal(121),
        ratingCount: z.literal(121),
        evidenceCount: z.number().int().nonnegative(),
        pendingEvaluationCount: z.literal(0),
        sourceConflictCount: z.literal(0),
        reviewStatus: z.literal("approved"),
      })
      .strict(),
    characters: z
      .array(
        z
          .object({
            slug,
            name: nonempty,
            entityType: z.literal("character"),
            element: nonempty,
            weapon: nonempty,
            rarity: z.union([z.literal(4), z.literal(5)]),
            officialReleaseVersion: nonempty,
            officialUrl: url,
            status: z.literal("active"),
          })
          .strict(),
      )
      .length(121),
    ratings: z
      .array(
        z
          .object({
            entitySlug: slug,
            ...scope,
            tier: z.enum(["S", "A+", "A", "B+", "B", "C", "D", "E", "F"]),
            primaryRole: nonempty.max(32),
            whyThisTier: nonempty,
            strengths: z.array(nonempty).min(1),
            limitations: z.array(nonempty).min(1),
            bestUseContext: nonempty,
            rankingAssumption: nonempty,
            evidenceSummary: nonempty,
            editorialStatus: z.literal("reviewed"),
          })
          .strict(),
      )
      .length(121),
    sources: z
      .array(
        z
          .object({
            key: slug,
            name: nonempty,
            publisher: nonempty,
            sourceType: nonempty.max(32),
            baseUrl: url,
          })
          .strict(),
      )
      .min(1),
    evidence: z.array(
      z
        .object({
          entitySlug: slug,
          sourceKey: slug,
          ...scope,
          observationType: nonempty.max(64),
          metricKey: nonempty.max(64).nullable(),
          numericValue: z.number().finite().nullable(),
          textValue: nonempty.nullable(),
          unit: nonempty.max(32).nullable(),
          sampleSize: z.number().int().nonnegative().max(2147483647).nullable(),
          sourceUrl: url,
          checkedAt: date,
          status: z.literal("verified"),
          notes: nonempty.nullable(),
        })
        .strict()
        .refine(
          (row) => row.numericValue !== null || row.textValue !== null,
          "Observation value required",
        )
        .refine(
          (row) =>
            row.unit !== "percent" ||
            (row.numericValue !== null && row.numericValue >= 0 && row.numericValue <= 100),
          "Invalid percent",
        ),
    ),
  })
  .strict();

export type ReviewedPackage = z.infer<typeof packageSchema>;

export function evidenceIdentity(row: ReviewedPackage["evidence"][number]) {
  return JSON.stringify([
    row.entitySlug,
    row.sourceKey,
    row.gameVersion,
    row.rankingContext,
    row.observationType,
    row.metricKey,
    row.sourceUrl,
    row.checkedAt,
  ]);
}

function unique(values: readonly string[], label: string) {
  if (new Set(values).size !== values.length) throw new Error(`Duplicate ${label}`);
}

export function validateReviewedPackage(input: unknown): ReviewedPackage {
  const pkg = packageSchema.parse(input);
  unique(
    pkg.characters.map((row) => row.slug),
    "character slug",
  );
  unique(
    pkg.ratings.map((row) => row.entitySlug),
    "entity rating",
  );
  unique(
    pkg.sources.map((row) => row.key),
    "source key",
  );
  unique(
    pkg.sources.map((row) => row.baseUrl),
    "source URL",
  );
  unique(pkg.evidence.map(evidenceIdentity), "evidence identity");
  const entities = new Set(pkg.characters.map((row) => row.slug));
  const sources = new Set(pkg.sources.map((row) => row.key));
  if (entities.has("manekin") || entities.has("manekina") || !entities.has("traveler")) {
    throw new Error("Frozen standard roster violated");
  }
  for (const row of [...pkg.ratings, ...pkg.evidence]) {
    if (!entities.has(row.entitySlug))
      throw new Error(`Unknown entity reference: ${row.entitySlug}`);
  }
  for (const row of pkg.evidence) {
    if (!sources.has(row.sourceKey)) throw new Error(`Unknown source reference: ${row.sourceKey}`);
  }
  if (pkg.evidence.length !== pkg.manifest.evidenceCount)
    throw new Error("Manifest evidence count mismatch");
  return pkg;
}

export async function readReviewedPackage(directory = defaultPackageDirectory) {
  const filenames = ["manifest", "character-master", "ratings", "sources", "evidence"] as const;
  const files = await Promise.all(
    filenames.map(
      async (name) =>
        JSON.parse(await readFile(path.join(directory, name + ".json"), "utf8")) as unknown,
    ),
  );
  return validateReviewedPackage({
    manifest: files[0],
    characters: files[1],
    ratings: files[2],
    sources: files[3],
    evidence: files[4],
  });
}

export function stableEditorialId(kind: string, identity: string) {
  return (
    "ed-" +
    createHash("sha256")
      .update(JSON.stringify([kind, identity]))
      .digest("hex")
      .slice(0, 33)
  );
}

export function packageLedger(pkg: ReviewedPackage) {
  const total =
    pkg.characters.length + pkg.ratings.length + pkg.sources.length + pkg.evidence.length;
  return { originalTotal: total, approved: total, deferred: 0, rejected: 0, unreviewed: 0 };
}
