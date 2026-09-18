import { createHash } from "node:crypto";

import type { CanonicalEntity } from "../../schemas/content.js";

export function canonicalTranslationSourceHash(entity: CanonicalEntity): string {
  const translatableSource = JSON.stringify(
    entity.kind === "ancestry"
      ? { name: entity.name }
      : {
          name: entity.name,
          content: entity.content.map(({ text }) => text),
        },
  );

  return createHash("sha256").update(translatableSource).digest("hex");
}
