// b_path:: packages/b_declarations/src/properties/background-blend-mode/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundBlendModeIR } from "./types";

export function generateBackgroundBlendMode(ir: BackgroundBlendModeIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const layerStrings: string[] = [];
  for (const value of ir.values) {
    const result = generateValue(value, Generators.BlendMode.generate);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "));
}
