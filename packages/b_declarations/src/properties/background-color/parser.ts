// b_path:: packages/b_declarations/src/properties/background-color/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type { BackgroundColorIR } from "./types";

export function parseBackgroundColor(value: string): ParseResult<BackgroundColorIR> {
  const colorResult = Parsers.Color.parse(value);
  
  if (colorResult.ok) {
    return {
      ok: true,
      property: "background-color",
      value: { kind: "value", value: colorResult.value },
      issues: colorResult.issues,
    };
  }

  return colorResult as ParseResult<BackgroundColorIR>;
}
