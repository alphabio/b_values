// b_path:: packages/b_declarations/src/properties/line-height/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { LineHeightIR } from "./types";

export function generateLineHeight(ir: LineHeightIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
