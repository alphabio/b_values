// b_path:: packages/b_declarations/src/properties/transform/generator.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import type { TransformIR } from "./types";

export function generateTransform(ir: TransformIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  if (ir.kind === "transform-list") {
    return Generators.Transform.generateList(ir.value);
  }

  return generateErr({ code: "invalid-value", severity: "error", message: "Invalid transform IR" });
}
