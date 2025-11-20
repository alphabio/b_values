// b_path:: packages/b_declarations/src/properties/animation-iteration-count/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { AnimationIterationCountIR } from "./types";

export function generateAnimationIterationCount(ir: AnimationIterationCountIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
