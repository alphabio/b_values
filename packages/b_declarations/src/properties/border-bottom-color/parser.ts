// b_path:: packages/b_declarations/src/properties/border-bottom-color/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BorderBottomColorIR } from "./types";

export function parseBorderBottomColor(ast: csstree.Value): ParseResult<BorderBottomColorIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "border-bottom-color",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-bottom-color" }],
    };
  }

  const colorResult = Parsers.Color.parseNode(firstNode);

  if (colorResult.ok) {
    return {
      ok: true,
      property: "border-bottom-color",
      value: { kind: "value", value: colorResult.value },
      issues: colorResult.issues,
    };
  }

  return colorResult as ParseResult<BorderBottomColorIR>;
}
