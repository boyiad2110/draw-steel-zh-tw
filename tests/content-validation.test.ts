import { describe, expect, it } from "vitest";

import {
  canonicalTranslationSourceHash,
  type ContentValidationInput,
  validateContentDocuments,
} from "../scripts/validate/content-validation.js";
import type { CanonicalEntity } from "../schemas/content.js";

const sourceLock = JSON.stringify({
  schemaVersion: 1,
  sources: [
    {
      id: "heroes-official-rules",
      kind: "local-file-set",
      snapshotLabel: "test fixture",
      publishedVersion: null,
      versionStatus: "UNRESOLVED",
      versionNote: "The test snapshot intentionally has no published version.",
      files: [
        {
          fileName: "1_DS_Ancestries.pdf",
          byteLength: 1,
          sha256: "1111111111111111111111111111111111111111111111111111111111111111",
        },
      ],
    },
    {
      id: "draw-steel-rules-reference-v1",
      kind: "drive-file",
      fileId: "drive-file-id",
      fileName: "DrawSteelRulesReferenceV1.pdf",
      sha256: "2222222222222222222222222222222222222222222222222222222222222222",
    },
  ],
});

const canonical = `
schemaVersion: 1
entities:
  - id: ancestry.human
    kind: ancestry
    name: Human
    mechanical: true
    mechanics:
      ancestryPoints: 3
    source:
      sourceId: heroes-official-rules
      version: sha256:1111111111111111111111111111111111111111111111111111111111111111
      fileName: 1_DS_Ancestries.pdf
      page: 19
      section: Human Traits
`;

const translation = `
schemaVersion: 1
locale: zh-TW
entries:
  - id: ancestry.human
    kind: ancestry
    name: 人類
    status: DRAFT
    sourceVersion: sha256:1111111111111111111111111111111111111111111111111111111111111111
    sourceHash: 28b6c4fcdfdc99f7abd17a1721e7dfebfde7f6bc16960e700b38e88d2c2dade2
`;

const lineOfEffect = `
schemaVersion: 1
entities:
  - id: rule.line-of-effect
    kind: rule
    name: Line of Effect
    content:
      - type: paragraph
        text: To target a creature, you must have line of effect.
    references: []
    source:
      sourceId: draw-steel-rules-reference-v1
      version: sha256:2222222222222222222222222222222222222222222222222222222222222222
      fileName: DrawSteelRulesReferenceV1.pdf
      page: 2
      section: Combat Glossary
`;

const cover = `
schemaVersion: 1
entities:
  - id: rule.cover
    kind: rule
    name: Cover
    content:
      - type: paragraph
        text: Cover requires line of effect.
    references:
      - rule.line-of-effect
    source:
      sourceId: draw-steel-rules-reference-v1
      version: sha256:2222222222222222222222222222222222222222222222222222222222222222
      fileName: DrawSteelRulesReferenceV1.pdf
      page: 2
      section: Combat Glossary
`;

const ruleEntity: CanonicalEntity = {
  id: "rule.cover",
  kind: "rule",
  name: "Cover",
  content: [{ type: "paragraph", text: "Cover requires line of effect." }],
  references: ["rule.line-of-effect"],
  source: {
    sourceId: "draw-steel-rules-reference-v1",
    version: "sha256:2222222222222222222222222222222222222222222222222222222222222222",
    fileName: "DrawSteelRulesReferenceV1.pdf",
    page: 2,
    section: "Combat Glossary",
  },
};

function input(overrides: Partial<ContentValidationInput> = {}): ContentValidationInput {
  return {
    sourceLock: { path: "sources.lock.json", text: sourceLock },
    canonicalDocuments: [{ path: "canonical.yaml", text: canonical }],
    translationDocuments: [{ path: "translation.yaml", text: translation }],
    ...overrides,
  };
}

describe("content validation", () => {
  it("accepts matching canonical and draft translation fixtures", () => {
    const result = validateContentDocuments(input());

    expect(result).toMatchObject({ ok: true, canonicalCount: 1, translationCount: 1 });
    expect(result.issues).toEqual([]);
  });

  it("preserves the existing ancestry translation source hash", () => {
    const ancestry: CanonicalEntity = {
      id: "ancestry.human",
      kind: "ancestry",
      name: "Human",
      mechanical: true,
      mechanics: { ancestryPoints: 3 },
      source: {
        sourceId: "heroes-official-rules",
        version: "sha256:1111111111111111111111111111111111111111111111111111111111111111",
        fileName: "1_DS_Ancestries.pdf",
        page: 19,
        section: "Human Traits",
      },
    };

    expect(canonicalTranslationSourceHash(ancestry)).toBe(
      "28b6c4fcdfdc99f7abd17a1721e7dfebfde7f6bc16960e700b38e88d2c2dade2",
    );
  });

  it("resolves canonical references across documents", () => {
    const result = validateContentDocuments(input({
      canonicalDocuments: [
        { path: "line-of-effect.yaml", text: lineOfEffect },
        { path: "cover.yaml", text: cover },
      ],
      translationDocuments: [],
    }));

    expect(result).toMatchObject({ ok: true, canonicalCount: 2 });
    expect(result.issues).toEqual([]);
  });

  it("reports dangling canonical references", () => {
    const result = validateContentDocuments(input({
      canonicalDocuments: [{
        path: "cover.yaml",
        text: cover.replace("rule.line-of-effect", "rule.missing"),
      }],
      translationDocuments: [],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "dangling_canonical_reference", path: "cover.yaml" }),
    ]));
  });

  it("reports a published reference whose target is not published", () => {
    const coverTranslation = `
schemaVersion: 1
locale: zh-TW
entries:
  - id: rule.cover
    kind: rule
    name: 掩護
    content:
      - type: paragraph
        text: 掩護需要效果線。
    status: APPROVED
    sourceVersion: sha256:2222222222222222222222222222222222222222222222222222222222222222
    sourceHash: ${canonicalTranslationSourceHash(ruleEntity)}
`;
    const result = validateContentDocuments(input({
      canonicalDocuments: [
        { path: "line-of-effect.yaml", text: lineOfEffect },
        { path: "cover.yaml", text: cover },
      ],
      translationDocuments: [{ path: "cover.zh-TW.yaml", text: coverTranslation }],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({
        code: "unpublished_reference_target",
        path: "cover.yaml",
      }),
    ]));
  });

  it("hashes all human-visible rule text", () => {
    const originalHash = canonicalTranslationSourceHash(ruleEntity);
    const renamedHash = canonicalTranslationSourceHash({ ...ruleEntity, name: "Cover Renamed" });
    const rewrittenHash = canonicalTranslationSourceHash({
      ...ruleEntity,
      content: [{ type: "paragraph", text: "Changed rule text." }],
    });

    expect(renamedHash).not.toBe(originalHash);
    expect(rewrittenHash).not.toBe(originalHash);
  });

  it("excludes references and provenance from rule translation hashes", () => {
    const originalHash = canonicalTranslationSourceHash(ruleEntity);
    const changedReferencesHash = canonicalTranslationSourceHash({
      ...ruleEntity,
      references: ["rule.concealment"],
    });
    const changedProvenanceHash = canonicalTranslationSourceHash({
      ...ruleEntity,
      source: { ...ruleEntity.source, page: 3, section: "Different Section" },
    });

    expect(changedReferencesHash).toBe(originalHash);
    expect(changedProvenanceHash).toBe(originalHash);
  });

  it.each([
    {
      name: "source ID",
      text: lineOfEffect.replace(
        "sourceId: draw-steel-rules-reference-v1",
        "sourceId: missing-source",
      ),
      code: "unknown_source",
    },
    {
      name: "file name",
      text: lineOfEffect.replace("DrawSteelRulesReferenceV1.pdf", "Wrong.pdf"),
      code: "source_file_mismatch",
    },
    {
      name: "SHA version",
      text: lineOfEffect.replace(/sha256:2{64}/, `sha256:${"3".repeat(64)}`),
      code: "source_version_mismatch",
    },
  ])("reports drive-file identity mismatch for $name", ({ text, code }) => {
    const result = validateContentDocuments(input({
      canonicalDocuments: [{ path: "rule.yaml", text }],
      translationDocuments: [],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code, path: "rule.yaml" }),
    ]));
  });

  it("requires translation kind to match canonical kind", () => {
    const result = validateContentDocuments(input({
      translationDocuments: [{
        path: "translation.yaml",
        text: translation.replace("kind: ancestry", "kind: rule").replace(
          "    name: 人類",
          "    name: 人類\n    content:\n      - type: paragraph\n        text: 測試",
        ),
      }],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "translation_kind_mismatch" }),
    ]));
  });

  it("reports malformed YAML", () => {
    const result = validateContentDocuments(input({
      canonicalDocuments: [{ path: "broken.yaml", text: "schemaVersion: [" }],
      translationDocuments: [],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "canonical_parse", path: "broken.yaml" }),
    ]));
  });

  it("reports duplicate canonical IDs", () => {
    const result = validateContentDocuments(input({
      canonicalDocuments: [
        { path: "first.yaml", text: canonical },
        { path: "second.yaml", text: canonical },
      ],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "duplicate_canonical_id", path: "second.yaml" }),
    ]));
  });

  it("reports dangling translation IDs", () => {
    const result = validateContentDocuments(input({
      translationDocuments: [{
        path: "translation.yaml",
        text: translation.replace("ancestry.human", "ancestry.missing"),
      }],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "dangling_translation_id" }),
    ]));
  });

  it("reports missing provenance on mechanical content", () => {
    const withoutProvenance = canonical.replace(/\n    source:\n(?:      .*\n)+/, "");
    const result = validateContentDocuments(input({
      canonicalDocuments: [{ path: "canonical.yaml", text: withoutProvenance }],
      translationDocuments: [],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "canonical_schema" }),
    ]));
  });

  it("requires non-stale translations to match the canonical source hash", () => {
    const result = validateContentDocuments(input({
      translationDocuments: [{
        path: "translation.yaml",
        text: translation.replace(
          "28b6c4fcdfdc99f7abd17a1721e7dfebfde7f6bc16960e700b38e88d2c2dade2",
          "ffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff",
        ),
      }],
    }));

    expect(result.issues).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: "translation_source_changed" }),
    ]));
  });
});
