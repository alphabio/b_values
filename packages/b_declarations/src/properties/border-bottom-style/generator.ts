// b_path:: packages/b_declarations/src/properties/border-bottom-style/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { BorderBottomStyleIR } from "./types";

export function generateBorderBottomStyle(ir: BorderBottomStyleIR): GenerateResult {
  return generateOk(ir.value);
}
