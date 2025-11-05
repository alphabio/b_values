// b_path:: packages/b_generators/src/color/rgb.ts
import { type GenerateResult, generateErr, generateOk, rgbColorSchema } from "@b/types";
import { cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#rgb-functions
 */
export function generate(color: unknown): GenerateResult {
  const validation = rgbColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(zodErrorToIssues(validation.error), "rgb-color");
  }

  const { r, g, b, alpha } = validation.data;

  const rgbPart = `${cssValueToCss(r)} ${cssValueToCss(g)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    return generateOk(`rgb(${rgbPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`rgb(${rgbPart})`);
}
