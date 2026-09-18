import { describe, expect, it } from "vitest";

import type { CanonicalEntity, TranslationEntry } from "../schemas/content.js";
import {
  createPublishedRulesProjection,
  stableRuleRoute,
} from "../src/domain/rules/published-rules.js";

type CanonicalRule = Extract<CanonicalEntity, { kind: "rule" }>;
type RuleTranslation = Extract<TranslationEntry, { kind: "rule" }>;

const source = {
  sourceId: "draw-steel-rules-reference-v1",
  version: "sha256:ab788bd960d08a74715f2a5238f649b43a8a64611d8b9dca9534ce4d69ce83cd",
  fileName: "DrawSteelRulesReferenceV1.pdf",
  page: 2,
  section: "Combat Glossary",
} as const;

const canonicalRules: CanonicalRule[] = [
  {
    id: "rule.line-of-effect",
    kind: "rule",
    name: "Line of Effect",
    content: [{
      type: "paragraph",
      text: "To target a creature or object with an ability, you must have line of effect to them. If a solid object completely blocks the creature from you, then you don’t have line of effect to them.",
    }],
    references: [],
    source,
  },
  {
    id: "rule.cover",
    kind: "rule",
    name: "Cover",
    content: [{
      type: "paragraph",
      text: "When you have line of effect to a creature or object but that target has at least half their form blocked by a solid obstruction such as a tree, wall, or overturned table, the target has cover. You take a bane on damage-dealing abilities used against creatures or objects that have cover from you.",
    }],
    references: ["rule.line-of-effect"],
    source,
  },
  {
    id: "rule.concealment",
    kind: "rule",
    name: "Concealment",
    content: [{
      type: "paragraph",
      text: "Darkness, fog, invisibility magic, and any other effect that fully obscures a creature or object but doesn’t protect their physical form grants that creature or object concealment. Even if you have line of effect to such a target, a creature or object has concealment from you if you can’t see or otherwise observe them. You can target a creature or object with concealment using a strike, provided they aren’t hidden. However, strikes against such targets take a bane.",
    }],
    references: ["rule.line-of-effect"],
    source,
  },
];

const translations: RuleTranslation[] = [
  {
    id: "rule.line-of-effect",
    kind: "rule",
    name: "效果線",
    content: [{ type: "paragraph", text: "效果線規則。" }],
    status: "APPROVED",
    sourceVersion: source.version,
    sourceHash: "0afbb2353cd843f30dd0729754d3ddfee06877d1631ec72a84a205b47f571d43",
  },
  {
    id: "rule.cover",
    kind: "rule",
    name: "掩護",
    content: [{ type: "paragraph", text: "掩護規則。" }],
    status: "APPROVED",
    sourceVersion: source.version,
    sourceHash: "b06702c332596196054da641fc2714a416c640d3b9942ece85a607f7c1cb4753",
  },
  {
    id: "rule.concealment",
    kind: "rule",
    name: "遮蔽",
    content: [{ type: "paragraph", text: "遮蔽規則。" }],
    status: "APPROVED",
    sourceVersion: source.version,
    sourceHash: "ef01634fb88866392e2f70d5cabea55596091de946f455d7a37c094678bac4d6",
  },
];

describe("published rules projection", () => {
  it("publishes only a current APPROVED rule translation", () => {
    const projection = createPublishedRulesProjection(
      [canonicalRules[0]],
      [translations[0]],
    );

    expect(projection.issues).toEqual([]);
    expect(projection.rules.map(({ id }) => id)).toEqual(["rule.line-of-effect"]);
  });

  it.each(["DRAFT", "REVIEW", "STALE"] as const)(
    "does not publish a %s translation",
    (status) => {
      const projection = createPublishedRulesProjection(
        [canonicalRules[0]],
        [{ ...translations[0], status }],
      );

      expect(projection).toEqual({ rules: [], issues: [] });
    },
  );

  it("does not publish a rule with a missing translation", () => {
    expect(createPublishedRulesProjection([canonicalRules[0]], [])).toEqual({
      rules: [],
      issues: [],
    });
  });

  it.each([
    ["source version", { sourceVersion: `sha256:${"f".repeat(64)}` }],
    ["source hash", { sourceHash: "f".repeat(64) }],
  ])("rejects an APPROVED translation with a mismatched %s", (_name, mismatch) => {
    const projection = createPublishedRulesProjection(
      [canonicalRules[0]],
      [{ ...translations[0], ...mismatch }],
    );

    expect(projection.rules).toEqual([]);
    expect(projection.issues).toEqual([
      expect.objectContaining({
        code: "approved_translation_not_current",
        ruleId: "rule.line-of-effect",
      }),
    ]);
  });

  it("derives a stable route from the stable ID, not display names", () => {
    expect(stableRuleRoute("rule.line-of-effect")).toBe("/rules/line-of-effect/");

    const projection = createPublishedRulesProjection(
      [canonicalRules[0]],
      [{ ...translations[0], name: "重新命名" }],
    );

    expect(projection.rules[0]?.route).toBe("/rules/line-of-effect/");
  });

  it("resolves related rules only when the target is also published", () => {
    const valid = createPublishedRulesProjection(
      canonicalRules.slice(0, 2),
      translations.slice(0, 2),
    );

    expect(valid.rules[1]?.relatedRules).toEqual([
      expect.objectContaining({
        id: "rule.line-of-effect",
        route: "/rules/line-of-effect/",
      }),
    ]);

    const invalid = createPublishedRulesProjection(
      canonicalRules.slice(0, 2),
      [{ ...translations[0], status: "DRAFT" }, translations[1]],
    );
    expect(invalid.rules).toEqual([]);
    expect(invalid.issues).toEqual([
      expect.objectContaining({
        code: "unpublished_reference_target",
        ruleId: "rule.cover",
        targetId: "rule.line-of-effect",
      }),
    ]);
  });

  it("produces the three expected routes and no ancestry route", () => {
    const ancestry: CanonicalEntity = {
      id: "ancestry.human",
      kind: "ancestry",
      name: "Human",
      mechanical: true,
      mechanics: { ancestryPoints: 3 },
      source: {
        sourceId: "heroes-official-rules",
        version: "sha256:e89fbf89d19891d994352bce0d108c49b8f7684a40e310c98eaf868b8542e7a7",
        fileName: "1_DS_Ancestries.pdf",
        page: 19,
        section: "Human Traits",
      },
    };
    const ancestryTranslation: TranslationEntry = {
      id: "ancestry.human",
      kind: "ancestry",
      name: "人類",
      status: "APPROVED",
      sourceVersion: ancestry.source.version,
      sourceHash: "28b6c4fcdfdc99f7abd17a1721e7dfebfde7f6bc16960e700b38e88d2c2dade2",
    };

    const projection = createPublishedRulesProjection(
      [...canonicalRules, ancestry],
      [...translations, ancestryTranslation],
    );

    expect(projection.issues).toEqual([]);
    expect(projection.rules.map(({ route }) => route)).toEqual([
      "/rules/line-of-effect/",
      "/rules/cover/",
      "/rules/concealment/",
    ]);
    expect(projection.rules.some(({ route }) => route.includes("ancestry"))).toBe(false);
  });
});
