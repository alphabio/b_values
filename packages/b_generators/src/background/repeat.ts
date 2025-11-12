// b_path:: packages/b_generators/src/background/repeat.ts

import { generateOk, type GenerateResult, type CssValue } from "@b/types";
import { cssValueToCss } from "@b/utils";

type RepetitionValue = "repeat" | "space" | "round" | "no-repeat";

type RepeatStyle =
  | { kind: "shorthand"; value: "repeat-x" | "repeat-y" }
  | { kind: "explicit"; horizontal: RepetitionValue; vertical: RepetitionValue };

/**
 * Generate CSS string for a single background-repeat value.
 *
 * Syntax: repeat-x | repeat-y | [ repeat | space | round | no-repeat ]{1,2} | var() | calc()
 *
 * @param style - The repeat style or CssValue
 * @returns GenerateResult with CSS string
 */
export function generate(style: RepeatStyle | CssValue): GenerateResult {
  // Handle CssValue types (var(), calc(), etc.)
  if ("kind" in style) {
    if (style.kind === "shorthand") {
      return generateOk(style.value);
    }
    if (style.kind === "explicit") {
      if (style.horizontal === style.vertical) {
        return generateOk(style.horizontal);
      }
      return generateOk(`${style.horizontal} ${style.vertical}`);
    }
    // Any other kind is a CssValue
    return generateOk(cssValueToCss(style));
  }

  // Fallback (shouldn't reach here with proper types)
  return generateOk(cssValueToCss(style as CssValue));
}
