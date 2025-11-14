// b_path:: packages/b_declarations/src/properties/animation-name/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { AnimationNameIR } from "./types";

export function generateAnimationName(ir: AnimationNameIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  return generateOk(ir.value);
}
