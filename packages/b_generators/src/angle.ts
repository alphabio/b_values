// b_path:: packages/b_generators/src/angle.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";

/**
 * Generate CSS angle string from Angle IR
 * @see https://drafts.csswg.org/css-values-4/#angles
 */
export function generate(angle: Type.Angle): GenerateResult {
  return generateOk(`${angle.value}${angle.unit}`);
}
