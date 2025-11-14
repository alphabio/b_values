// b_path:: packages/b_declarations/src/properties/animation-direction/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { AnimationDirectionIR } from "./types";

export function generateAnimationDirection(ir: AnimationDirectionIR): GenerateResult {
  return generateOk(ir.value);
}
