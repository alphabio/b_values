// b_path:: packages/b_generators/src/color/hsl.ts
import { type GenerateResult, generateErr, generateOk, createError, hslColorSchema } from "@b/types";
import type { HSLColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#the-hsl-notation
 */
export function generate(color: HSLColor): GenerateResult {
  const validation = hslColorSchema.safeParse(color);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return generateErr(createError("invalid-ir", `Invalid HSLColor: ${issue?.path.join(".")}: ${issue?.message}`));
  }

  const { h, s, l, alpha } = validation.data;

  const hslPart = `${cssValueToCss(h)} ${cssValueToCss(s)} ${cssValueToCss(l)}`;

  if (alpha !== undefined) {
    return generateOk(`hsl(${hslPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`hsl(${hslPart})`);
}
