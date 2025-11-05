// b_path:: packages/b_generators/src/color/rgb.ts
import { type GenerateResult, generateErr, generateOk, createError, rgbColorSchema } from "@b/types";
import type { RGBColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#rgb-functions
 */
export function generate(color: RGBColor): GenerateResult {
  const validation = rgbColorSchema.safeParse(color);
  if (!validation.success) {
    const issue = validation.error.issues[0];
    return generateErr(createError("invalid-ir", `Invalid RGBColor: ${issue?.path.join(".")}: ${issue?.message}`));
  }

  const { r, g, b, alpha } = validation.data;

  const rgbPart = `${cssValueToCss(r)} ${cssValueToCss(g)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    return generateOk(`rgb(${rgbPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`rgb(${rgbPart})`);
}
