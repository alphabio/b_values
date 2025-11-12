// b_path:: packages/b_generators/src/blend-mode.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BlendMode } from "@b/keywords";

/**
 * Generate CSS <blend-mode> value
 */
export function generate(value: BlendMode): GenerateResult {
  return generateOk(value);
}
