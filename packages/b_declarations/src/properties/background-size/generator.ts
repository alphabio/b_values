// b_path:: packages/b_declarations/src/properties/background-size/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { BackgroundSize } from "./types";

export function generateBackgroundSize(ir: BackgroundSize): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value, "background-size");
  }

  const layerStrings: string[] = [];

  for (let i = 0; i < ir.layers.length; i++) {
    const result = Generators.Background.generateBackgroundSizeValue(ir.layers[i]);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "), "background-size");
}
