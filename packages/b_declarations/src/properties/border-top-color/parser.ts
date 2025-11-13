// b_path:: packages/b_declarations/src/properties/border-top-color/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BorderTopColorIR } from "./types";

export function parseBorderTopColor(ast: csstree.Value): ParseResult<BorderTopColorIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "border-top-color",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-top-color" }],
    };
  }

  const colorResult = Parsers.Color.parseNode(firstNode);

  if (colorResult.ok) {
    return {
      ok: true,
      property: "border-top-color",
      value: { kind: "value", value: colorResult.value },
      issues: colorResult.issues,
    };
  }

  return colorResult as ParseResult<BorderTopColorIR>;
}
