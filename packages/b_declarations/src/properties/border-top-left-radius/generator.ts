// b_path:: packages/b_declarations/src/properties/border-top-left-radius/generator.ts

import { generateOk, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import type { BorderTopLeftRadiusIR } from "./types";

export function generateBorderTopLeftRadius(ir: BorderTopLeftRadiusIR): GenerateResult {
  if (ir.kind === "keyword") {
    return generateOk(ir.value);
  }

  if (ir.kind === "circular") {
    const css = cssValueToCss(ir.radius);
    return generateOk(css);
  }

  // elliptical
  const horizontal = cssValueToCss(ir.horizontal);
  const vertical = cssValueToCss(ir.vertical);
  return generateOk(`${horizontal} ${vertical}`);
}
