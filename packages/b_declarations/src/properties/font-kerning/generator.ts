// b_path:: packages/b_declarations/src/properties/font-kerning/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { FontKerningIR } from "./types";

export function generateFontKerning(ir: FontKerningIR): GenerateResult {
  return generateOk(ir.value);
}
