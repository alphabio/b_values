// b_path:: packages/b_declarations/src/properties/visibility/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { VisibilityIR } from "./types";

export function generateVisibility(ir: VisibilityIR): GenerateResult {
  return generateOk(ir.value);
}
