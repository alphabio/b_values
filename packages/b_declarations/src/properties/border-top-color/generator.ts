// b_path:: packages/b_declarations/src/properties/border-top-color/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BorderTopColorIR } from "./types";

export function generateBorderTopColor(ir: BorderTopColorIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.Color.generate(ir.value);
  return result;
}
