// b_path:: packages/b_declarations/src/properties/margin-top/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { MarginTopIR } from "./types";

export function parseMarginTop(ast: csstree.Value): ParseResult<MarginTopIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "margin-top",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for margin-top" }],
    };
  }

  // Check for 'auto' keyword
  if (firstNode.type === "Identifier" && firstNode.name === "auto") {
    return {
      ok: true,
      property: "margin-top",
      value: { kind: "keyword", value: "auto" },
      issues: [],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "margin-top",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<MarginTopIR>;
}
