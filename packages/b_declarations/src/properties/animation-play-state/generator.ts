// b_path:: packages/b_declarations/src/properties/animation-play-state/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { AnimationPlayStateIR } from "./types";

export function generateAnimationPlayState(ir: AnimationPlayStateIR): GenerateResult {
  return generateOk(ir.value);
}
