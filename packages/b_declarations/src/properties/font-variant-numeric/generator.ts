// b_path:: packages/b_declarations/src/properties/font-variant-numeric/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { FontVariantNumericIR } from "./types";

export function generateFontVariantNumeric(ir: FontVariantNumericIR): GenerateResult {
  return generateOk(ir.value);
}
