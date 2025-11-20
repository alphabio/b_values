// b_path:: packages/b_declarations/src/properties/text-transform/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { TextTransformIR } from "./types";

export function generateTextTransform(ir: TextTransformIR): GenerateResult {
  return generateOk(ir.value);
}
