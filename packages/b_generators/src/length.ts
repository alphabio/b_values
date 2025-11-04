// b_path:: packages/b_generators/src/length.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";

/**
 * Generate CSS length string from Length IR
 * @see https://drafts.csswg.org/css-values-4/#lengths
 */
export function generate(length: Type.Length): GenerateResult {
  return generateOk(`${length.value}${length.unit}`);
}

/**
 * Generate CSS length-percentage string from LengthPercentage IR
 * @see https://drafts.csswg.org/css-values-4/#percentage-value
 */
export function generateLengthPercentage(lengthPercentage: Type.LengthPercentage): GenerateResult {
  return generateOk(`${lengthPercentage.value}${lengthPercentage.unit}`);
}
