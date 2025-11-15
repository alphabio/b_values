// b_path:: packages/b_declarations/src/properties/font-style/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generator from "@b/generators";
import type { FontStyleIR } from "./types";

export function generateFontStyle(ir: FontStyleIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  if (ir.angle) {
    const angleResult = Generator.Angle.generate(ir.angle);
    if (!angleResult.ok) {
      return angleResult;
    }
    return generateOk(`oblique ${angleResult.value}`);
  }

  return generateOk("oblique");
}
