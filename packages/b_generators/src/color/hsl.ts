// b_path:: packages/b_generators/src/color/hsl.ts
import { type GenerateResult, generateErr, generateOk, hslColorSchema } from "@b/types";
import { cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#the-hsl-notation
 */
export function generate(color: unknown): GenerateResult {
  const validation = hslColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(zodErrorToIssues(validation.error), "hsl-color");
  }

  const { h, s, l, alpha } = validation.data;

  const hslPart = `${cssValueToCss(h)} ${cssValueToCss(s)} ${cssValueToCss(l)}`;

  if (alpha !== undefined) {
    return generateOk(`hsl(${hslPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`hsl(${hslPart})`);
}
