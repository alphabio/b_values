// b_path:: packages/b_declarations/src/properties/margin-top/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { MarginTopIR } from "./types";

export function generateMarginTop(ir: MarginTopIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
