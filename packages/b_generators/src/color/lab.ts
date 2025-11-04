// b_path:: packages/b_generators/src/color/lab.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { LABColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#lab-colors
 */
export function generate(color: LABColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "LABColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected LABColor object, got ${typeof color}`));
  }
  if (!("l" in color) || !("a" in color) || !("b" in color)) {
    return generateErr(createError("missing-required-field", "LABColor must have 'l', 'a', 'b' fields"));
  }

  const { l, a, b, alpha } = color;

  const labPart = `${cssValueToCss(l)} ${cssValueToCss(a)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    return generateOk(`lab(${labPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`lab(${labPart})`);
}
