// b_path:: packages/b_declarations/src/properties/background-repeat/generator.ts
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundRepeatIR } from "./types";

/**
 * Generate CSS for background-repeat property.
 */
export function generateBackgroundRepeat(ir: BackgroundRepeatIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value, "background-repeat");
  }

  const layerStrings: string[] = [];
  for (const layer of ir.values) {
    const result = generateValue(layer, Generators.Background.generateBackgroundRepeatValue);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "), "background-repeat");
}
