// b_path:: packages/b_declarations/src/properties/transition-property/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { TransitionPropertyIR } from "./types";

export function generateTransitionProperty(ir: TransitionPropertyIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  return generateOk(ir.value);
}
