// b_path:: packages/b_declarations/src/properties/font-variant-caps/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { FontVariantCapsIR } from "./types";

export function generateFontVariantCaps(ir: FontVariantCapsIR): GenerateResult {
  return generateOk(ir.value);
}
