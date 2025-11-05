// b_path:: packages/b_generators/src/color/lch.ts
import { type GenerateResult, generateErr, generateOk, createError, lchColorSchema } from "@b/types";
import type { LCHColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * Generates LCH color CSS from IR
 * Supports literals, variables (var()), and keywords (none)
 * @see https://drafts.csswg.org/css-color/#lch-colors
 */
export function generate(color: LCHColor): GenerateResult {
  const validation = lchColorSchema.safeParse(color);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return generateErr(createError("invalid-ir", `Invalid LCHColor: ${issue?.path.join(".")}: ${issue?.message}`));
  }

  const { l, c, h, alpha } = validation.data;

  const lchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  if (alpha !== undefined) {
    return generateOk(`lch(${lchPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`lch(${lchPart})`);
}
