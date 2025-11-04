// b_path:: packages/b_generators/src/color/hwb.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { HWBColor } from "@b/types";

/**
 * @see https://drafts.csswg.org/css-color/#the-hwb-notation
 */
export function generate(color: HWBColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "HWBColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected HWBColor object, got ${typeof color}`));
  }
  if (!("h" in color) || !("w" in color) || !("b" in color)) {
    return generateErr(createError("missing-required-field", "HWBColor must have 'h', 'w', 'b' fields"));
  }

  const { h, w, b, alpha } = color;

  let result = `hwb(${h} ${w}% ${b}%`;

  if (alpha !== undefined && alpha !== 1) {
    result += ` / ${alpha}`;
  }

  result += ")";
  return generateOk(result);
}
