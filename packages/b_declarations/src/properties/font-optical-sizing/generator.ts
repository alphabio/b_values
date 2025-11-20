// b_path:: packages/b_declarations/src/properties/font-optical-sizing/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { FontOpticalSizingIR } from "./types";

export function generateFontOpticalSizing(ir: FontOpticalSizingIR): GenerateResult {
  return generateOk(ir.value);
}
