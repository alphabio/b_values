// b_path:: packages/b_declarations/src/properties/perspective-origin/generator.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { PerspectiveOriginIR } from "./types";

export function generatePerspectiveOrigin(ir: PerspectiveOriginIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  if (ir.kind === "position") {
    const positionResult = Generators.Position.generate(ir.value);
    if (!positionResult.ok) {
      return positionResult;
    }
    return generateOk(positionResult.value);
  }

  return generateErr({ code: "invalid-value", severity: "error", message: "Invalid perspective-origin IR" });
}
