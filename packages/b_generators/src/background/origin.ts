// b_path:: packages/b_generators/src/background/origin.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BackgroundOrigin } from "@b/keywords";

/**
 * Generate CSS string for a single background-origin value.
 *
 * Syntax: border-box | padding-box | content-box
 *
 * @param value - The box value
 * @returns GenerateResult with CSS string
 */
export function generateOrigin(value: BackgroundOrigin): GenerateResult {
  return generateOk(value);
}
