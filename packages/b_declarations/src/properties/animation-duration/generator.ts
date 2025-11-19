// b_path:: packages/b_declarations/src/properties/animation-duration/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { AnimationDurationIR } from "./types";

export function generateAnimationDuration(ir: AnimationDurationIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
