// b_path:: packages/b_declarations/src/properties/transform-style/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { TransformStyleIR } from "./types";

export function generateTransformStyle(ir: TransformStyleIR): GenerateResult {
  return generateOk(ir.value);
}
