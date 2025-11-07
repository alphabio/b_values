// b_path:: packages/b_declarations/src/properties/background-size/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundSizeIR } from "./types";

export function generateBackgroundSize(ir: BackgroundSizeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value, "background-size");
  }

  const valueStrings: string[] = [];

  for (let i = 0; i < ir.values.length; i++) {
    const result = Generators.Background.generateBackgroundSizeValue(ir.values[i]);
    if (!result.ok) return result;
    valueStrings.push(result.value);
  }

  return generateOk(valueStrings.join(", "), "background-size");
}
