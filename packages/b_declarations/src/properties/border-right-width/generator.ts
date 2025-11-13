// b_path:: packages/b_declarations/src/properties/border-right-width/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { BorderRightWidthIR } from "./types";

export function generateBorderRightWidth(ir: BorderRightWidthIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
