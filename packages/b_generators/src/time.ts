// b_path:: packages/b_generators/src/time.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";

/**
 * Generate CSS time string from Time IR
 * @see https://drafts.csswg.org/css-values-4/#time
 */
export function generate(time: Type.Time): GenerateResult {
  return generateOk(`${time.value}${time.unit}`);
}
