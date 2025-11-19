// b_path:: packages/b_declarations/src/properties/font-weight/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { FontWeightIR } from "./types";

export function generateFontWeight(ir: FontWeightIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
