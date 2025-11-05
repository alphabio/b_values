// b_path:: packages/b_generators/src/gradient/index.ts
export * as ColorStop from "./color-stop";
export * as Linear from "./linear";
export * as Radial from "./radial";
export * as Conic from "./conic";

import { createError, generateErr, type GenerateResult, type Gradient } from "@b/types";
import * as Linear from "./linear";
import * as Radial from "./radial";
import * as Conic from "./conic";

/**
 * Generate CSS string for any gradient type.
 * Routes to the appropriate gradient generator based on kind.
 */
export function generate(gradient: Gradient): GenerateResult {
  switch (gradient.kind) {
    case "linear":
      return Linear.generate(gradient);
    case "radial":
      return Radial.generate(gradient);
    case "conic":
      return Conic.generate(gradient);
    default:
      return generateErr(
        createError("unsupported-kind", `Unsupported gradient kind: ${(gradient as { kind: string }).kind}`),
      );
  }
}
