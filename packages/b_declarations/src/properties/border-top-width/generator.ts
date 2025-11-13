// b_path:: packages/b_declarations/src/properties/border-top-width/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { BorderTopWidthIR } from "./types";

export function generateBorderTopWidth(ir: BorderTopWidthIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
