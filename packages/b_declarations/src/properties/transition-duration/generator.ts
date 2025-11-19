// b_path:: packages/b_declarations/src/properties/transition-duration/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { TransitionDurationIR } from "./types";

export function generateTransitionDuration(ir: TransitionDurationIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
