// b_path:: packages/b_generators/src/background/clip.ts

import { generateOk, type GenerateResult, type CssValue } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * Generate CSS string for a single background-clip value.
 *
 * Syntax: border-box | padding-box | content-box | text | var() | calc()
 *
 * @param value - The CssValue (keyword, var(), calc(), etc.)
 * @returns GenerateResult with CSS string
 */
export function generateClip(value: CssValue): GenerateResult {
  return generateOk(cssValueToCss(value));
}
