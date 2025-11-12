// b_path:: packages/b_generators/src/background/size.ts

import { generateOk, type GenerateResult, type BgSize } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * Generate CSS string for a single <bg-size> value.
 *
 * Syntax: [ <length-percentage [0,∞]> | auto ]{1,2} | cover | contain
 *
 * @param size - The BgSize IR
 * @returns GenerateResult with CSS string
 */
export function generate(size: BgSize): GenerateResult {
  if (size.kind === "keyword") {
    return generateOk(size.value);
  }

  // Explicit size
  const widthCss = cssValueToCss(size.width);
  const heightCss = cssValueToCss(size.height);

  // If height is 'auto' and width is not, we can use the one-value syntax.
  if (heightCss === "auto" && widthCss !== "auto") {
    return generateOk(widthCss);
  }

  // If both values happen to be the same (e.g. 'auto auto' or 'cover cover')
  if (widthCss === heightCss) {
    return generateOk(widthCss);
  }

  // Different values - output both
  return generateOk(`${widthCss} ${heightCss}`);
}
