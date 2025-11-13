// b_path:: packages/b_declarations/src/properties/border-top-style/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BorderTopStyleIR } from "./types";

export function generateBorderTopStyle(ir: BorderTopStyleIR): GenerateResult {
  return generateOk(ir.value);
}
