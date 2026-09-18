import { z } from "zod";

const sha256 = z.string().regex(/^[a-f0-9]{64}$/, "Expected a lowercase SHA-256 value");
const gitCommit = z.string().regex(/^[a-f0-9]{40}$/, "Expected a 40-character Git commit");
const stableId = z.string().regex(/^[a-z][a-z0-9-]*(?:\.[a-z][a-z0-9-]*)+$/, "Expected a stable dotted ID");

const gitSourceSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("git"),
  repository: z.string().url(),
  commit: gitCommit,
});

const driveFileSourceSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("drive-file"),
  fileId: z.string().min(1),
  fileName: z.string().min(1),
  sha256,
});

const localFileSetSourceSchema = z.object({
  id: z.string().min(1),
  kind: z.literal("local-file-set"),
  snapshotLabel: z.string().min(1),
  publishedVersion: z.string().min(1).nullable(),
  versionStatus: z.enum(["RESOLVED", "UNRESOLVED"]),
  versionNote: z.string().min(1),
  files: z.array(
    z.object({
      fileName: z.string().min(1),
      byteLength: z.number().int().positive(),
      sha256,
    }),
  ).min(1),
});

export const sourceLockSchema = z.object({
  schemaVersion: z.literal(1),
  sources: z.array(z.discriminatedUnion("kind", [
    gitSourceSchema,
    driveFileSourceSchema,
    localFileSetSourceSchema,
  ])).min(1),
});

const provenanceSchema = z.object({
  sourceId: z.string().min(1),
  version: z.string().min(1),
  fileName: z.string().min(1),
  page: z.number().int().positive(),
  printedPage: z.number().int().positive().optional(),
  section: z.string().min(1),
});

const ancestryCanonicalEntitySchema = z.object({
  id: stableId,
  kind: z.literal("ancestry"),
  name: z.string().min(1),
  mechanical: z.literal(true),
  mechanics: z.object({
    ancestryPoints: z.number().int().nonnegative(),
  }),
  source: provenanceSchema,
});

const paragraphBlockSchema = z.object({
  type: z.literal("paragraph"),
  text: z.string().min(1),
});

const ruleCanonicalEntitySchema = z.object({
  id: stableId,
  kind: z.literal("rule"),
  name: z.string().min(1),
  content: z.array(paragraphBlockSchema).min(1),
  references: z.array(stableId),
  source: provenanceSchema,
});

export const canonicalEntitySchema = z.discriminatedUnion("kind", [
  ancestryCanonicalEntitySchema,
  ruleCanonicalEntitySchema,
]);

export const canonicalDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  entities: z.array(canonicalEntitySchema).min(1),
});

export const translationStatusSchema = z.enum(["DRAFT", "REVIEW", "APPROVED", "STALE"]);

const translationSourceSchema = z.object({
  status: translationStatusSchema,
  sourceVersion: z.string().min(1),
  sourceHash: sha256,
});

const ancestryTranslationEntrySchema = z.object({
  id: stableId,
  kind: z.literal("ancestry"),
  name: z.string().min(1),
}).extend(translationSourceSchema.shape);

const ruleTranslationEntrySchema = z.object({
  id: stableId,
  kind: z.literal("rule"),
  name: z.string().min(1),
  content: z.array(paragraphBlockSchema).min(1),
}).extend(translationSourceSchema.shape);

export const translationEntrySchema = z.discriminatedUnion("kind", [
  ancestryTranslationEntrySchema,
  ruleTranslationEntrySchema,
]);

export const translationDocumentSchema = z.object({
  schemaVersion: z.literal(1),
  locale: z.literal("zh-TW"),
  entries: z.array(translationEntrySchema).min(1),
});

export type CanonicalEntity = z.infer<typeof canonicalEntitySchema>;
export type SourceLock = z.infer<typeof sourceLockSchema>;
export type TranslationEntry = z.infer<typeof translationEntrySchema>;
