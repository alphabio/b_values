// b_path:: packages/b_declarations/src/properties/transform-origin/generator.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { TransformOriginIR } from "./types";

export function generateTransformOrigin(ir: TransformOriginIR): GenerateResult {
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

  return generateErr({ code: "invalid-value", severity: "error", message: "Invalid transform-origin IR" });
}
