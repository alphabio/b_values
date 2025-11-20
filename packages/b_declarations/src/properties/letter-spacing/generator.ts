// b_path:: packages/b_declarations/src/properties/letter-spacing/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { LetterSpacingIR } from "./types";

export function generateLetterSpacing(ir: LetterSpacingIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
