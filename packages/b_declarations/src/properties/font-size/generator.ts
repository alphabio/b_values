// b_path:: packages/b_declarations/src/properties/font-size/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { FontSizeIR } from "./types";

export function generateFontSize(ir: FontSizeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
