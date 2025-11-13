// b_path:: packages/b_declarations/src/properties/border-right-color/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BorderRightColorIR } from "./types";

export function generateBorderRightColor(ir: BorderRightColorIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.Color.generate(ir.value);
  return result;
}
