// b_path:: packages/b_declarations/src/properties/margin-left/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { MarginLeftIR } from "./types";

export function generateMarginLeft(ir: MarginLeftIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
