// b_path:: packages/b_declarations/src/properties/font-variant-ligatures/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { FontVariantLigaturesIR } from "./types";

export function generateFontVariantLigatures(ir: FontVariantLigaturesIR): GenerateResult {
  return generateOk(ir.value);
}
