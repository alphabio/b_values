// b_path:: packages/b_declarations/src/properties/animation-timing-function/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { AnimationTimingFunctionIR } from "./types";

export function generateAnimationTimingFunction(ir: AnimationTimingFunctionIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.EasingFunction.generate(ir.value);
  return result;
}
