// b_path:: packages/b_declarations/src/properties/animation-duration/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { AnimationDurationIR } from "./types";

export function generateAnimationDuration(ir: AnimationDurationIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.Time.generate(ir.value);
  return result;
}
