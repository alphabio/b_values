// b_path:: packages/b_declarations/src/properties/transition-delay/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { TransitionDelayIR } from "./types";

export function generateTransitionDelay(ir: TransitionDelayIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
