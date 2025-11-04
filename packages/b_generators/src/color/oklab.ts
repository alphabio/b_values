// b_path:: packages/b_generators/src/color/oklab.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { OKLabColor } from "@b/types";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lab
 */
export function generate(color: OKLabColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "OKLabColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected OKLabColor object, got ${typeof color}`));
  }
  if (!("l" in color) || !("a" in color) || !("b" in color)) {
    return generateErr(createError("missing-required-field", "OKLabColor must have 'l', 'a', 'b' fields"));
  }

  const { l, a, b, alpha } = color;

  const oklabPart = `${l} ${a} ${b}`;

  if (alpha !== undefined && alpha < 1) {
    return generateOk(`oklab(${oklabPart} / ${alpha})`);
  }

  return generateOk(`oklab(${oklabPart})`);
}
