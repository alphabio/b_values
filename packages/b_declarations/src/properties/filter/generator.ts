// b_path:: packages/b_declarations/src/properties/filter/generator.ts

import { generateErr, generateOk, type GenerateResult } from "@b/types";
import type { FilterIR } from "./types";
import * as Generators from "@b/generators";
import { cssValueToCss } from "@b/utils";

export function generateFilter(ir: FilterIR): GenerateResult {
  switch (ir.kind) {
    case "keyword":
      return generateOk(ir.value);

    case "css-value":
      return generateOk(cssValueToCss(ir.value));

    case "filter-list":
      return Generators.Filter.generateList(ir.value);

    default:
      return generateErr({ code: "unsupported-kind", severity: "error", message: "Unsupported filter IR" });
  }
}
