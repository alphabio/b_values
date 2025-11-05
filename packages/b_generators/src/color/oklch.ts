// b_path:: packages/b_generators/src/color/oklch.ts
import { type GenerateResult, generateErr, generateOk, createError, oklchColorSchema } from "@b/types";
import type { OKLCHColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lch
 */
export function generate(color: OKLCHColor): GenerateResult {
  const validation = oklchColorSchema.safeParse(color);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return generateErr(createError("invalid-ir", `Invalid OKLCHColor: ${issue?.path.join(".")}: ${issue?.message}`));
  }

  const { l, c, h, alpha } = validation.data;

  const oklchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  if (alpha !== undefined) {
    return generateOk(`oklch(${oklchPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`oklch(${oklchPart})`);
}
