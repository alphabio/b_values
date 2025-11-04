// b_path:: packages/b_generators/src/color/special.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { SpecialColor } from "@b/types";

/**
 * @see https://drafts.csswg.org/css-color/#typedef-color
 */
export function generate(color: SpecialColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "SpecialColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected SpecialColor object, got ${typeof color}`));
  }
  if (!("keyword" in color)) {
    return generateErr(createError("missing-required-field", "SpecialColor must have 'keyword' field"));
  }
  return generateOk(color.keyword);
}
