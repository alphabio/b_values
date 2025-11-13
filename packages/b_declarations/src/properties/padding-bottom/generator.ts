// b_path:: packages/b_declarations/src/properties/padding-bottom/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { PaddingBottomIR } from "./types";

export function generatePaddingBottom(ir: PaddingBottomIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
