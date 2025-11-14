// b_path:: packages/b_declarations/src/properties/opacity/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { OpacityIR } from "./types";

export function generateOpacity(ir: OpacityIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  return generateOk(ir.value.toString());
}
