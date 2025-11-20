// b_path:: packages/b_declarations/src/properties/word-spacing/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { WordSpacingIR } from "./types";

export function generateWordSpacing(ir: WordSpacingIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
