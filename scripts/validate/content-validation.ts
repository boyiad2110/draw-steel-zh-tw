import { createHash } from "node:crypto";

import { z } from "zod";
import { parseDocument } from "yaml";

import {
  canonicalDocumentSchema,
  type CanonicalEntity,
  sourceLockSchema,
  type SourceLock,
  translationDocumentSchema,
  type TranslationEntry,
} from "../../schemas/content.js";

export interface TextDocument {
  path: string;
  text: string;
}

export interface ContentValidationInput {
  sourceLock: TextDocument;
  canonicalDocuments: TextDocument[];
  translationDocuments: TextDocument[];
}

export interface ValidationIssue {
  code: string;
  path: string;
  message: string;
}

export interface ContentValidationResult {
  ok: boolean;
  canonicalCount: number;
  translationCount: number;
  issues: ValidationIssue[];
}

interface LoadedEntity<T> {
  entity: T;
  path: string;
}

function formatZodIssues(error: z.ZodError): string {
  return error.issues
    .map((issue) => `${issue.path.join(".") || "<root>"}: ${issue.message}`)
    .join("; ");
}

function parseJson<T>(
  document: TextDocument,
  schema: z.ZodType<T>,
  issues: ValidationIssue[],
): T | undefined {
  let value: unknown;
  try {
    value = JSON.parse(document.text);
  } catch (error) {
    issues.push({
      code: "source_lock_parse",
      path: document.path,
      message: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    issues.push({
      code: "source_lock_schema",
      path: document.path,
      message: formatZodIssues(result.error),
    });
    return undefined;
  }
  return result.data;
}

function parseYaml<T>(
  document: TextDocument,
  schema: z.ZodType<T>,
  issueCode: string,
  issues: ValidationIssue[],
): T | undefined {
  let value: unknown;
  try {
    const parsed = parseDocument(document.text, { uniqueKeys: true });
    if (parsed.errors.length > 0) {
      issues.push({
        code: `${issueCode}_parse`,
        path: document.path,
        message: parsed.errors.map((error) => error.message).join("; "),
      });
      return undefined;
    }
    value = parsed.toJS();
  } catch (error) {
    issues.push({
      code: `${issueCode}_parse`,
      path: document.path,
      message: error instanceof Error ? error.message : String(error),
    });
    return undefined;
  }

  const result = schema.safeParse(value);
  if (!result.success) {
    issues.push({
      code: `${issueCode}_schema`,
      path: document.path,
      message: formatZodIssues(result.error),
    });
    return undefined;
  }
  return result.data;
}

export function canonicalTranslationSourceHash(entity: CanonicalEntity): string {
  const translatableSource = JSON.stringify({ name: entity.name });
  return createHash("sha256").update(translatableSource).digest("hex");
}

function validateUniqueIds<T extends { id: string }>(
  loaded: LoadedEntity<T>[],
  code: string,
  issues: ValidationIssue[],
): void {
  const firstPathById = new Map<string, string>();
  for (const { entity, path } of loaded) {
    const firstPath = firstPathById.get(entity.id);
    if (firstPath) {
      issues.push({
        code,
        path,
        message: `Duplicate ID ${entity.id}; first declared in ${firstPath}`,
      });
    } else {
      firstPathById.set(entity.id, path);
    }
  }
}

function validateSourceLockIds(sourceLock: SourceLock, path: string, issues: ValidationIssue[]): void {
  const seen = new Set<string>();
  for (const source of sourceLock.sources) {
    if (seen.has(source.id)) {
      issues.push({ code: "duplicate_source_id", path, message: `Duplicate source ID ${source.id}` });
    }
    seen.add(source.id);
  }
}

function validateProvenance(
  canonical: LoadedEntity<CanonicalEntity>[],
  sourceLock: SourceLock,
  issues: ValidationIssue[],
): void {
  const sources = new Map(sourceLock.sources.map((source) => [source.id, source]));

  for (const { entity, path } of canonical) {
    const lockedSource = sources.get(entity.source.sourceId);
    if (!lockedSource) {
      issues.push({
        code: "unknown_source",
        path,
        message: `${entity.id} references unlocked source ${entity.source.sourceId}`,
      });
      continue;
    }

    if (lockedSource.kind === "local-file-set") {
      const lockedFile = lockedSource.files.find((file) => file.fileName === entity.source.fileName);
      if (!lockedFile) {
        issues.push({
          code: "unknown_source_file",
          path,
          message: `${entity.id} references unlocked file ${entity.source.fileName}`,
        });
        continue;
      }

      const expectedVersion = `sha256:${lockedFile.sha256}`;
      if (entity.source.version !== expectedVersion) {
        issues.push({
          code: "source_version_mismatch",
          path,
          message: `${entity.id} source version must be ${expectedVersion}`,
        });
      }
    }
  }
}

function validateTranslations(
  translations: LoadedEntity<TranslationEntry>[],
  canonical: LoadedEntity<CanonicalEntity>[],
  issues: ValidationIssue[],
): void {
  const canonicalById = new Map(canonical.map(({ entity }) => [entity.id, entity]));

  for (const { entity: translation, path } of translations) {
    const source = canonicalById.get(translation.id);
    if (!source) {
      issues.push({
        code: "dangling_translation_id",
        path,
        message: `Translation ${translation.id} has no canonical entity`,
      });
      continue;
    }

    const sourceChanged =
      translation.sourceVersion !== source.source.version ||
      translation.sourceHash !== canonicalTranslationSourceHash(source);

    if (sourceChanged && translation.status !== "STALE") {
      issues.push({
        code: "translation_source_changed",
        path,
        message: `Translation ${translation.id} must be marked STALE after its canonical source changes`,
      });
    }
  }
}

export function validateContentDocuments(input: ContentValidationInput): ContentValidationResult {
  const issues: ValidationIssue[] = [];
  const sourceLock = parseJson(input.sourceLock, sourceLockSchema, issues);
  const canonical: LoadedEntity<CanonicalEntity>[] = [];
  const translations: LoadedEntity<TranslationEntry>[] = [];

  for (const document of input.canonicalDocuments) {
    const parsed = parseYaml(document, canonicalDocumentSchema, "canonical", issues);
    if (parsed) {
      canonical.push(...parsed.entities.map((entity) => ({ entity, path: document.path })));
    }
  }

  for (const document of input.translationDocuments) {
    const parsed = parseYaml(document, translationDocumentSchema, "translation", issues);
    if (parsed) {
      translations.push(...parsed.entries.map((entity) => ({ entity, path: document.path })));
    }
  }

  validateUniqueIds(canonical, "duplicate_canonical_id", issues);
  validateUniqueIds(translations, "duplicate_translation_id", issues);

  if (sourceLock) {
    validateSourceLockIds(sourceLock, input.sourceLock.path, issues);
    validateProvenance(canonical, sourceLock, issues);
  }
  validateTranslations(translations, canonical, issues);

  return {
    ok: issues.length === 0,
    canonicalCount: canonical.length,
    translationCount: translations.length,
    issues,
  };
}
