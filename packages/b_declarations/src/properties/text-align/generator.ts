// b_path:: packages/b_declarations/src/properties/text-align/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { TextAlignIR } from "./types";

export function generateTextAlign(ir: TextAlignIR): GenerateResult {
  return generateOk(ir.value);
}
