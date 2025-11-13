// b_path:: packages/b_declarations/src/properties/margin-right/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { MarginRightIR } from "./types";

export function generateMarginRight(ir: MarginRightIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
