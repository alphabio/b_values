// b_path:: packages/b_declarations/src/properties/transition-duration/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import * as Generators from "@b/generators";
import { cssValueToCss } from "@b/utils";
import type { TransitionDurationIR } from "./types";

export function generateTransitionDuration(ir: TransitionDurationIR): GenerateResult {
  switch (ir.kind) {
    case "keyword":
      return generateOk(ir.value);

    case "time":
      return Generators.Time.generate(ir.value);

    case "value": {
      const css = cssValueToCss(ir.value);
      return generateOk(css);
    }
  }
}
