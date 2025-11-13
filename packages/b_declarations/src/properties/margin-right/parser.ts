// b_path:: packages/b_declarations/src/properties/margin-right/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { MarginRightIR } from "./types";

export function parseMarginRight(ast: csstree.Value): ParseResult<MarginRightIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "margin-right",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for margin-right" }],
    };
  }

  // Check for 'auto' keyword
  if (firstNode.type === "Identifier" && firstNode.name === "auto") {
    return {
      ok: true,
      property: "margin-right",
      value: { kind: "keyword", value: "auto" },
      issues: [],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "margin-right",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<MarginRightIR>;
}
