// b_path:: packages/b_declarations/src/properties/border-bottom-color/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BorderBottomColorIR } from "./types";

export function generateBorderBottomColor(ir: BorderBottomColorIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.Color.generate(ir.value);
  return result;
}
