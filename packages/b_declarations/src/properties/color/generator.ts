// b_path:: packages/b_declarations/src/properties/color/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { ColorIR } from "./types";

export function generateColor(ir: ColorIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const result = Generators.Color.generate(ir.value);
  return result;
}
