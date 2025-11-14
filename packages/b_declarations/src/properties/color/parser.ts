// b_path:: packages/b_declarations/src/properties/color/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { ColorIR } from "./types";

export function parseColor(ast: csstree.Value): ParseResult<ColorIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "color",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for color" }],
    };
  }

  const colorResult = Parsers.Color.parseNode(firstNode);

  if (colorResult.ok) {
    return {
      ok: true,
      property: "color",
      value: { kind: "value", value: colorResult.value },
      issues: colorResult.issues,
    };
  }

  return colorResult as ParseResult<ColorIR>;
}
