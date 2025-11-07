// b_path:: packages/b_generators/src/background-attachment/generator.ts

import { generateOk, type GenerateResult } from "@b/types";

type AttachmentValue = "scroll" | "fixed" | "local";

/**
 * Generate CSS string for a single background-attachment value.
 *
 * Syntax: scroll | fixed | local
 *
 * @param value - The attachment value
 * @returns GenerateResult with CSS string
 */
export function generateBackgroundAttachmentValue(value: AttachmentValue): GenerateResult {
  return generateOk(value);
}
