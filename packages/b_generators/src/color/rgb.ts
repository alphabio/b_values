// b_path:: packages/b_generators/src/color/rgb.ts
import { type GenerateResult, generateErr, generateOk, createError } from "@b/types";
import type { RGBColor } from "@b/types";

/**
 * @see https://drafts.csswg.org/css-color/#rgb-functions
 */
export function generate(color: RGBColor): GenerateResult {
  if (color === undefined || color === null) {
    return generateErr(createError("invalid-ir", "RGBColor must not be null or undefined"));
  }
  if (typeof color !== "object") {
    return generateErr(createError("invalid-ir", `Expected RGBColor object, got ${typeof color}`));
  }
  if (!("r" in color) || !("g" in color) || !("b" in color)) {
    return generateErr(createError("missing-required-field", "RGBColor must have 'r', 'g', 'b' fields"));
  }

  const { r, g, b, alpha } = color;

  const rgbPart = `${Math.round(r)} ${Math.round(g)} ${Math.round(b)}`;

  if (alpha !== undefined && alpha < 1) {
    return generateOk(`rgb(${rgbPart} / ${alpha})`);
  }

  return generateOk(`rgb(${rgbPart})`);
}
