// b_path:: packages/b_declarations/src/properties/background-size/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundSizeIR } from "./types";

/**
 * Generate CSS for background-size property.
 * Returns value-only (no property prefix).
 */
export function generateBackgroundSize(ir: BackgroundSizeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const valueStrings: string[] = [];

  for (let i = 0; i < ir.values.length; i++) {
    const result = generateValue(ir.values[i], Generators.Background.generateSize);
    if (!result.ok) return result;
    valueStrings.push(result.value);
  }

  return generateOk(valueStrings.join(", "));
}
