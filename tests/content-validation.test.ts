import { describe, expect, it } from "vitest";

import {
  type ContentValidationInput,
  validateContentDocuments,
} from "../scripts/validate/content-validation.js";

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
    name: 人類
    status: DRAFT
    sourceVersion: sha256:1111111111111111111111111111111111111111111111111111111111111111
    sourceHash: 28b6c4fcdfdc99f7abd17a1721e7dfebfde7f6bc16960e700b38e88d2c2dade2
`;

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
