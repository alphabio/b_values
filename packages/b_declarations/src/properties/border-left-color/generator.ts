// b_path:: packages/b_declarations/src/properties/border-left-color/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BorderLeftColorIR } from "./types";

export function generateBorderLeftColor(ir: BorderLeftColorIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.Color.generate(ir.value);
  return result;
}
