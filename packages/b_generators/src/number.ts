// b_path:: packages/b_generators/src/number.ts
import { generateOk, type GenerateResult } from "@b/types";

/**
 * Generate CSS number from numeric value
 * @see https://drafts.csswg.org/css-values-4/#numbers
 */
export function generate(value: number): GenerateResult {
  return generateOk(String(value));
}
