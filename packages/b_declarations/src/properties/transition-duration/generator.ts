// b_path:: packages/b_declarations/src/properties/transition-duration/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { TransitionDurationIR } from "./types";

export function generateTransitionDuration(ir: TransitionDurationIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.Time.generate(ir.value);
  return result;
}
