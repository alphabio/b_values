// b_path:: packages/b_generators/src/background-origin/generator.ts

import { generateOk, type GenerateResult } from "@b/types";

type OriginBoxValue = "border-box" | "padding-box" | "content-box";

/**
 * Generate CSS string for a single background-origin value.
 *
 * Syntax: border-box | padding-box | content-box
 *
 * @param value - The box value
 * @returns GenerateResult with CSS string
 */
export function generateBackgroundOriginValue(value: OriginBoxValue): GenerateResult {
  return generateOk(value);
}
