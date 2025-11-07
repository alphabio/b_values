// b_path:: packages/b_generators/src/background/clip.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BackgroundClip } from "@b/keywords";

/**
 * Generate CSS string for a single background-clip value.
 *
 * Syntax: border-box | padding-box | content-box | text
 *
 * @param value - The box value
 * @returns GenerateResult with CSS string
 */
export function generateBackgroundClipValue(value: BackgroundClip): GenerateResult {
  return generateOk(value);
}
