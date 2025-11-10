// b_path:: packages/b_declarations/src/properties/background-position/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { generateValue } from "../../utils";
import type { BackgroundPositionIR } from "./types";

export function generateBackgroundPosition(ir: BackgroundPositionIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const layerStrings: string[] = [];
  for (const value of ir.values) {
    const result = generateValue(value, Generators.Position.generate);
    if (!result.ok) return result;
    layerStrings.push(result.value);
  }

  return generateOk(layerStrings.join(", "));
}
