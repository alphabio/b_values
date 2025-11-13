// b_path:: packages/b_declarations/src/properties/border-right-color/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BorderRightColorIR } from "./types";

export function parseBorderRightColor(ast: csstree.Value): ParseResult<BorderRightColorIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "border-right-color",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-right-color" }],
    };
  }

  const colorResult = Parsers.Color.parseNode(firstNode);

  if (colorResult.ok) {
    return {
      ok: true,
      property: "border-right-color",
      value: { kind: "value", value: colorResult.value },
      issues: colorResult.issues,
    };
  }

  return colorResult as ParseResult<BorderRightColorIR>;
}
