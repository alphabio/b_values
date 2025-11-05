// b_path:: packages/b_generators/src/color/lab.ts
import { type GenerateResult, generateErr, generateOk, createError, labColorSchema } from "@b/types";
import type { LABColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#lab-colors
 */
export function generate(color: LABColor): GenerateResult {
  const validation = labColorSchema.safeParse(color);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return generateErr(createError("invalid-ir", `Invalid LABColor: ${issue?.path.join(".")}: ${issue?.message}`));
  }

  const { l, a, b, alpha } = validation.data;

  const labPart = `${cssValueToCss(l)} ${cssValueToCss(a)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    return generateOk(`lab(${labPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`lab(${labPart})`);
}
