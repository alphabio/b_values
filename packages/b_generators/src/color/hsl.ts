// b_path:: packages/b_generators/src/color/hsl.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { HSLColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#the-hsl-notation
 */
export function generate(color: HSLColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "HSLColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected HSLColor object, got ${typeof color}`));
  }
  if (!("h" in color) || !("s" in color) || !("l" in color)) {
    return generateErr(createError("missing-required-field", "HSLColor must have 'h', 's', 'l' fields"));
  }

  const { h, s, l, alpha } = color;

  const hslPart = `${cssValueToCss(h)} ${cssValueToCss(s)} ${cssValueToCss(l)}`;

  if (alpha !== undefined) {
    return generateOk(`hsl(${hslPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`hsl(${hslPart})`);
}
