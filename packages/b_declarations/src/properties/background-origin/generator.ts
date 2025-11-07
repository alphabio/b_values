// b_path:: packages/b_declarations/src/properties/background-origin/generator.ts
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundOriginIR } from "./types";

/**
 * Generate CSS for background-origin property.
 */
export function generateBackgroundOrigin(ir: BackgroundOriginIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value, "background-origin");
  }

  const layerStrings: string[] = [];
  for (const layer of ir.layers) {
    const result = Generators.Background.generateBackgroundOriginValue(layer);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "), "background-origin");
}
