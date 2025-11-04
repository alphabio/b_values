// b_path:: packages/b_generators/src/color/hex.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { HexColor } from "@b/types";

/**
 * @see https://drafts.csswg.org/css-color/#hex-notation
 */
export function generate(color: HexColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "HexColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected HexColor object, got ${typeof color}`));
  }
  if (!("value" in color)) {
    return generateErr(createError("missing-required-field", "HexColor must have 'value' field"));
  }
  return generateOk(color.value);
}
