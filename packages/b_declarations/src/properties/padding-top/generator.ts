// b_path:: packages/b_declarations/src/properties/padding-top/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { PaddingTopIR } from "./types";

export function generatePaddingTop(ir: PaddingTopIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
