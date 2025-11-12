// b_path:: packages/b_declarations/src/properties/background-origin/generator.ts
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundOriginIR } from "./types";

/**
 * Generate CSS for background-origin property.
 * Returns value-only (no property prefix).
 */
export function generateBackgroundOrigin(ir: BackgroundOriginIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const layerStrings: string[] = [];
  for (const layer of ir.values) {
    const result = generateValue(layer, Generators.Background.generateOrigin);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "));
}
