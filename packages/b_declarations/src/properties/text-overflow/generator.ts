// b_path:: packages/b_declarations/src/properties/text-overflow/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { TextOverflowIR } from "./types";

export function generateTextOverflow(ir: TextOverflowIR): GenerateResult {
  return generateOk(ir.value);
}
