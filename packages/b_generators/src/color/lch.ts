// b_path:: packages/b_generators/src/color/lch.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { LCHColor } from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * Generates LCH color CSS from IR
 * Supports literals, variables (var()), and keywords (none)
 * @see https://drafts.csswg.org/css-color/#lch-colors
 */
export function generate(color: LCHColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "LCHColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected LCHColor object, got ${typeof color}`));
  }
  if (!("l" in color) || !("c" in color) || !("h" in color)) {
    return generateErr(createError("missing-required-field", "LCHColor must have 'l', 'c', 'h' fields"));
  }

  const { l, c, h, alpha } = color;

  const lchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  if (alpha !== undefined) {
    return generateOk(`lch(${lchPart} / ${cssValueToCss(alpha)})`);
  }

  return generateOk(`lch(${lchPart})`);
}
