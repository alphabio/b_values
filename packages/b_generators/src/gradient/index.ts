// b_path:: packages/b_generators/src/gradient/index.ts
export * as ColorStop from "./color-stop";
export * as Linear from "./linear";
export * as Radial from "./radial";
export * as Conic from "./conic";

import type { Gradient, GenerateResult } from "@b/types";
import * as Linear from "./linear";
import * as Radial from "./radial";
import * as Conic from "./conic";

/**
 * Generate CSS string for any gradient type.
 * Routes to the appropriate gradient generator based on kind.
 *
 * @throws {Error} If generation fails (should not happen with valid IR)
 */
export function generate(gradient: Gradient): string {
  let result: GenerateResult;
  switch (gradient.kind) {
    case "linear":
      result = Linear.generate(gradient);
      break;
    case "radial":
      result = Radial.generate(gradient);
      break;
    case "conic":
      result = Conic.generate(gradient);
      break;
  }

  if (!result.ok) {
    throw new Error(`Failed to generate gradient: ${result.issues.map((i) => i.message).join(", ")}`);
  }

  return result.value;
}
