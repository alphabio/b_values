// b_path:: packages/b_declarations/src/properties/background-position-x/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { BackgroundPositionXIR } from "./types";

export function generateBackgroundPositionX(ir: BackgroundPositionXIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  const valueStrings: string[] = [];
  for (const value of ir.values) {
    const css = cssValueToCss(value);
    valueStrings.push(css);
  }

  return generateOk(valueStrings.join(", "));
}
