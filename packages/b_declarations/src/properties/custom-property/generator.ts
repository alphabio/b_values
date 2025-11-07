// b_path:: packages/b_declarations/src/properties/custom-property/generator.ts
import type { GenerateResult } from "@b/types";
import { generateOk } from "@b/types";
import type { CustomPropertyIR } from "./types";

/**
 * Generate CSS from custom property IR
 */
export function generateCustomProperty(ir: CustomPropertyIR): GenerateResult {
  return generateOk(ir.value);
}
