// b_path:: packages/b_generators/src/color/named.ts
import { namedColorSchema } from "@b/keywords";
import { type GenerateResult, generateOk, createError } from "@b/types";
import type { NamedColor } from "@b/types";

/**
 * @see https://drafts.csswg.org/css-color/#named-colors
 */
export function generate(color: NamedColor): GenerateResult {
  const validation = namedColorSchema.safeParse(color.name);

  if (!validation.success) {
    return {
      ok: false,
      issues: validation.error.issues.map((issue) => createError("invalid-value", issue.message)),
    };
  }

  return generateOk(color.name);
}
