// b_path:: packages/b_declarations/src/properties/border-left-color/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BorderLeftColorIR } from "./types";

export function parseBorderLeftColor(ast: csstree.Value): ParseResult<BorderLeftColorIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "border-left-color",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-left-color" }],
    };
  }

  const colorResult = Parsers.Color.parseNode(firstNode);

  if (colorResult.ok) {
    return {
      ok: true,
      property: "border-left-color",
      value: { kind: "value", value: colorResult.value },
      issues: colorResult.issues,
    };
  }

  return colorResult as ParseResult<BorderLeftColorIR>;
}
