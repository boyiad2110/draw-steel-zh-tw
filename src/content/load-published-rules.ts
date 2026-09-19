import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

import { parseDocument } from "yaml";

import {
  canonicalDocumentSchema,
  translationDocumentSchema,
} from "../../schemas/content.js";
import {
  assertPublishedRulesProjection,
  createPublishedRulesProjection,
  type PublishedRule,
} from "../domain/rules/published-rules.js";

const repositoryRoot = process.cwd();

async function readYaml(path: string): Promise<unknown> {
  const text = await readFile(resolve(repositoryRoot, path), "utf8");
  const document = parseDocument(text, { uniqueKeys: true });

  if (document.errors.length > 0) {
    throw new Error(
      `${path}: ${document.errors.map((error) => error.message).join("; ")}`,
    );
  }

  return document.toJS();
}

export async function loadPublishedRules(): Promise<PublishedRule[]> {
  const [canonicalInput, translationInput] = await Promise.all([
    readYaml("content/canonical/rules/combat-glossary.yaml"),
    readYaml("translation/zh-TW/rules/combat-glossary.yaml"),
  ]);

  const canonical = canonicalDocumentSchema.parse(canonicalInput);
  const translation = translationDocumentSchema.parse(translationInput);

  return assertPublishedRulesProjection(
    createPublishedRulesProjection(canonical.entities, translation.entries),
  );
}
