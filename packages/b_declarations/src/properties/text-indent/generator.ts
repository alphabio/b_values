// b_path:: packages/b_declarations/src/properties/text-indent/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { TextIndentIR } from "./types";

export function generateTextIndent(ir: TextIndentIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const css = cssValueToCss(ir.value);
  return generateOk(css);
}
