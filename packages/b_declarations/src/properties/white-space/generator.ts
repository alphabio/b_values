// b_path:: packages/b_declarations/src/properties/white-space/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import type { WhiteSpaceIR } from "./types";

export function generateWhiteSpace(ir: WhiteSpaceIR): GenerateResult {
  return generateOk(ir.value);
}
