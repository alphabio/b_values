// b_path:: packages/b_declarations/src/properties/font-variant/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { FontVariantIR } from "./types";

export function generateFontVariant(ir: FontVariantIR): GenerateResult {
  return generateOk(ir.value);
}
