// b_path:: packages/b_generators/src/background/attachment.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BackgroundAttachment } from "@b/keywords";

/**
 * Generate CSS string for a single background-attachment value.
 *
 * Syntax: scroll | fixed | local
 *
 * @param value - The attachment value
 * @returns GenerateResult with CSS string
 */
export function generate(value: BackgroundAttachment): GenerateResult {
  return generateOk(value);
}
