// b_path:: packages/b_declarations/src/properties/background-clip/generator.ts
import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundClipIR } from "./types";

/**
 * Generate CSS for background-clip property.
 */
export function generateBackgroundClip(ir: BackgroundClipIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value, "background-clip");
  }

  const layerStrings: string[] = [];
  for (const layer of ir.values) {
    const result = Generators.Background.generateBackgroundClipValue(layer);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "), "background-clip");
}
