// b_path:: packages/b_declarations/src/properties/font-stretch/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { FontStretchIR } from "./types";

export function generateFontStretch(ir: FontStretchIR): GenerateResult {
  return generateOk(ir.value);
}
