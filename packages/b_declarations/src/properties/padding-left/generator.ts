// b_path:: packages/b_declarations/src/properties/padding-left/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { PaddingLeftIR } from "./types";

export function generatePaddingLeft(ir: PaddingLeftIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
