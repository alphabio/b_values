// b_path:: packages/b_declarations/src/properties/animation-fill-mode/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { AnimationFillModeIR } from "./types";

export function generateAnimationFillMode(ir: AnimationFillModeIR): GenerateResult {
  return generateOk(ir.value);
}
