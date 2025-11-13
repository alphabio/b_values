// b_path:: packages/b_declarations/src/properties/margin-bottom/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { MarginBottomIR } from "./types";

export function parseMarginBottom(ast: csstree.Value): ParseResult<MarginBottomIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "margin-bottom",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for margin-bottom" }],
    };
  }

  // Check for 'auto' keyword
  if (firstNode.type === "Identifier" && firstNode.name === "auto") {
    return {
      ok: true,
      property: "margin-bottom",
      value: { kind: "keyword", value: "auto" },
      issues: [],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "margin-bottom",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<MarginBottomIR>;
}
