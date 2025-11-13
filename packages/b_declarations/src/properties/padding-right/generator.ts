// b_path:: packages/b_declarations/src/properties/padding-right/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { PaddingRightIR } from "./types";

export function generatePaddingRight(ir: PaddingRightIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
