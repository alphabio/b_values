// b_path:: packages/b_generators/src/color/oklch.ts
import { type GenerateResult, generateErr, generateOk, oklchColorSchema } from "@b/types";
import { cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lch
 */
export function generate(color: unknown): GenerateResult {
  const validation = oklchColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(zodErrorToIssues(validation.error), "oklch-color");
  }

  const { l, c, h, alpha } = validation.data;

  const oklchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  if (alpha !== undefined) {
    return generateOk(`oklch(${oklchPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`oklch(${oklchPart})`);
}
