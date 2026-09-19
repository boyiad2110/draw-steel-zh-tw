import type { CanonicalEntity, TranslationEntry } from "../../../schemas/content.js";
import { canonicalTranslationSourceHash } from "../../content/canonical-translation.js";

type CanonicalRule = Extract<CanonicalEntity, { kind: "rule" }>;
type RuleTranslation = Extract<TranslationEntry, { kind: "rule" }>;

export type PublishedRulesIssueCode =
  | "approved_translation_not_current"
  | "invalid_published_rule_id"
  | "unpublished_reference_target";

export interface PublishedRulesIssue {
  code: PublishedRulesIssueCode;
  ruleId: string;
  message: string;
  targetId?: string;
}

export interface PublishedRuleLink {
  id: string;
  name: string;
  canonicalName: string;
  route: string;
}

export interface PublishedRule extends PublishedRuleLink {
  slug: string;
  content: RuleTranslation["content"];
  relatedRules: PublishedRuleLink[];
  source: CanonicalRule["source"];
}

export interface PublishedRulesProjection {
  rules: PublishedRule[];
  issues: PublishedRulesIssue[];
}

export class PublishedRulesProjectionError extends Error {
  readonly issues: PublishedRulesIssue[];

  constructor(issues: PublishedRulesIssue[]) {
    super(issues.map((issue) => `[${issue.code}] ${issue.message}`).join("; "));
    this.name = "PublishedRulesProjectionError";
    this.issues = issues;
  }
}

export function stableRuleSlug(id: string): string {
  const match = /^rule\.([a-z][a-z0-9-]*)$/.exec(id);
  if (!match) {
    throw new Error(`Rule ID ${id} cannot produce a stable Reader route`);
  }

  return match[1];
}

export function stableRuleRoute(id: string): string {
  return `/rules/${stableRuleSlug(id)}/`;
}

function isCurrentApprovedTranslation(
  canonical: CanonicalRule,
  translation: RuleTranslation,
): boolean {
  return translation.status === "APPROVED" &&
    translation.sourceVersion === canonical.source.version &&
    translation.sourceHash === canonicalTranslationSourceHash(canonical);
}

export function createPublishedRulesProjection(
  canonicalEntities: CanonicalEntity[],
  translations: TranslationEntry[],
): PublishedRulesProjection {
  const issues: PublishedRulesIssue[] = [];
  const translationsById = new Map(
    translations
      .filter((translation): translation is RuleTranslation => translation.kind === "rule")
      .map((translation) => [translation.id, translation]),
  );

  const candidates: Array<{
    canonical: CanonicalRule;
    translation: RuleTranslation;
    slug: string;
    route: string;
  }> = [];

  for (const canonical of canonicalEntities) {
    if (canonical.kind !== "rule") {
      continue;
    }

    const translation = translationsById.get(canonical.id);
    if (!translation || translation.status !== "APPROVED") {
      continue;
    }

    if (!isCurrentApprovedTranslation(canonical, translation)) {
      issues.push({
        code: "approved_translation_not_current",
        ruleId: canonical.id,
        message: `Approved translation ${canonical.id} does not match its canonical source`,
      });
      continue;
    }

    try {
      const slug = stableRuleSlug(canonical.id);
      candidates.push({ canonical, translation, slug, route: stableRuleRoute(canonical.id) });
    } catch (error) {
      issues.push({
        code: "invalid_published_rule_id",
        ruleId: canonical.id,
        message: error instanceof Error ? error.message : String(error),
      });
    }
  }

  const candidatesById = new Map(candidates.map((candidate) => [candidate.canonical.id, candidate]));

  for (const { canonical } of candidates) {
    for (const targetId of canonical.references) {
      if (!candidatesById.has(targetId)) {
        issues.push({
          code: "unpublished_reference_target",
          ruleId: canonical.id,
          targetId,
          message: `Published rule ${canonical.id} references unpublished rule ${targetId}`,
        });
      }
    }
  }

  if (issues.length > 0) {
    return { rules: [], issues };
  }

  const rules = candidates.map(({ canonical, translation, slug, route }) => ({
    id: canonical.id,
    slug,
    route,
    name: translation.name,
    canonicalName: canonical.name,
    content: translation.content,
    relatedRules: canonical.references.map((targetId) => {
      const target = candidatesById.get(targetId);
      if (!target) {
        throw new Error(`Projection invariant failed for ${canonical.id} -> ${targetId}`);
      }

      return {
        id: target.canonical.id,
        name: target.translation.name,
        canonicalName: target.canonical.name,
        route: target.route,
      };
    }),
    source: canonical.source,
  }));

  return { rules, issues: [] };
}

export function assertPublishedRulesProjection(projection: PublishedRulesProjection): PublishedRule[] {
  if (projection.issues.length > 0) {
    throw new PublishedRulesProjectionError(projection.issues);
  }

  return projection.rules;
}
