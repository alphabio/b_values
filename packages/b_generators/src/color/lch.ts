// b_path:: packages/b_generators/src/color/lch.ts
import { type GenerateResult, generateErr, generateOk, lchColorSchema } from "@b/types";
import { cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * Generates LCH color CSS from IR
 * Supports literals, variables (var()), and keywords (none)
 * @see https://drafts.csswg.org/css-color/#lch-colors
 */
export function generate(color: unknown): GenerateResult {
  const validation = lchColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(zodErrorToIssues(validation.error), "lch-color");
  }

  const { l, c, h, alpha } = validation.data;

  const lchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  if (alpha !== undefined) {
    return generateOk(`lch(${lchPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`lch(${lchPart})`);
}
