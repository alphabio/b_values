// b_path:: packages/b_generators/src/color/hwb.ts
import { type GenerateResult, generateErr, generateOk, createError, hwbColorSchema } from "@b/types";
import type { HWBColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#the-hwb-notation
 */
export function generate(color: HWBColor): GenerateResult {
  const validation = hwbColorSchema.safeParse(color);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return generateErr(createError("invalid-ir", `Invalid HWBColor: ${issue?.path.join(".")}: ${issue?.message}`));
  }

  const { h, w, b, alpha } = validation.data;

  let result = `hwb(${cssValueToCss(h)} ${cssValueToCss(w)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    result += ` / ${cssValueToCss(alpha)}`;
  }

  result += ")";
  return generateOk(result);
}
