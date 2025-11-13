// b_path:: packages/b_declarations/src/properties/border-right-style/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BorderRightStyleIR } from "./types";

export function generateBorderRightStyle(ir: BorderRightStyleIR): GenerateResult {
  return generateOk(ir.value);
}
