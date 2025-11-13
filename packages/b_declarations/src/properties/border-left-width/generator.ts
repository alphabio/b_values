// b_path:: packages/b_declarations/src/properties/border-left-width/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { BorderLeftWidthIR } from "./types";

export function generateBorderLeftWidth(ir: BorderLeftWidthIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
