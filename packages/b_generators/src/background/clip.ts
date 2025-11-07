// b_path:: packages/b_generators/src/background-clip/generator.ts

import { generateOk, type GenerateResult } from "@b/types";

type BoxValue = "border-box" | "padding-box" | "content-box" | "text";

/**
 * Generate CSS string for a single background-clip value.
 *
 * Syntax: border-box | padding-box | content-box | text
 *
 * @param value - The box value
 * @returns GenerateResult with CSS string
 */
export function generateBackgroundClipValue(value: BoxValue): GenerateResult {
  return generateOk(value);
}
