// b_path:: packages/b_declarations/src/properties/border-left-style/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BorderLeftStyleIR } from "./types";

export function generateBorderLeftStyle(ir: BorderLeftStyleIR): GenerateResult {
  return generateOk(ir.value);
}
