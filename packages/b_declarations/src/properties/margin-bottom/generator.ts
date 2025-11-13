// b_path:: packages/b_declarations/src/properties/margin-bottom/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { MarginBottomIR } from "./types";

export function generateMarginBottom(ir: MarginBottomIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
