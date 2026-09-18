import { readdir, readFile } from "node:fs/promises";
import { dirname, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import {
  type TextDocument,
  validateContentDocuments,
} from "./content-validation.js";

const repositoryRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../..");

async function readYamlDocuments(directory: string): Promise<TextDocument[]> {
  const entries = await readdir(directory, { recursive: true, withFileTypes: true });
  const paths = entries
    .filter((entry) => entry.isFile() && /\.ya?ml$/i.test(entry.name))
    .map((entry) => resolve(entry.parentPath, entry.name))
    .sort();

  return Promise.all(paths.map(async (path) => ({
    path: relative(repositoryRoot, path).replaceAll("\\", "/"),
    text: await readFile(path, "utf8"),
  })));
}

async function main(): Promise<void> {
  const sourceLockPath = resolve(repositoryRoot, "sources.lock.json");
  const result = validateContentDocuments({
    sourceLock: {
      path: "sources.lock.json",
      text: await readFile(sourceLockPath, "utf8"),
    },
    canonicalDocuments: await readYamlDocuments(resolve(repositoryRoot, "content/canonical")),
    translationDocuments: await readYamlDocuments(resolve(repositoryRoot, "translation/zh-TW")),
  });

  if (!result.ok) {
    for (const issue of result.issues) {
      console.error(`[${issue.code}] ${issue.path}: ${issue.message}`);
    }
    process.exitCode = 1;
    return;
  }

  console.log(
    `Content validation passed: ${result.canonicalCount} canonical entity, ` +
      `${result.translationCount} zh-TW translation.`,
  );
}

await main();
