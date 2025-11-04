// b_path:: packages/b_generators/src/color/oklch.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { OKLCHColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lch
 */
export function generate(color: OKLCHColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "OKLCHColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected OKLCHColor object, got ${typeof color}`));
  }
  if (!("l" in color) || !("c" in color) || !("h" in color)) {
    return generateErr(createError("missing-required-field", "OKLCHColor must have 'l', 'c', 'h' fields"));
  }

  const { l, c, h, alpha } = color;

  const oklchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  if (alpha !== undefined) {
    return generateOk(`oklch(${oklchPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`oklch(${oklchPart})`);
}
