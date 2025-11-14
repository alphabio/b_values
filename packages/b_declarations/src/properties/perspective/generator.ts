// b_path:: packages/b_declarations/src/properties/perspective/generator.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { PerspectiveIR } from "./types";

export function generatePerspective(ir: PerspectiveIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  if (ir.kind === "length") {
    const lengthResult = Generators.Length.generate(ir.value);
    if (!lengthResult.ok) {
      return lengthResult;
    }
    return generateOk(lengthResult.value);
  }

  return generateErr({ code: "invalid-value", severity: "error", message: "Invalid perspective IR" });
}
