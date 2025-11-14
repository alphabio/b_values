// b_path:: packages/b_declarations/src/properties/transition-timing-function/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { TransitionTimingFunctionIR } from "./types";

export function generateTransitionTimingFunction(ir: TransitionTimingFunctionIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.EasingFunction.generate(ir.value);
  return result;
}
