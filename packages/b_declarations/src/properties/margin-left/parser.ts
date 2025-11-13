// b_path:: packages/b_declarations/src/properties/margin-left/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { MarginLeftIR } from "./types";

export function parseMarginLeft(ast: csstree.Value): ParseResult<MarginLeftIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "margin-left",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for margin-left" }],
    };
  }

  // Check for 'auto' keyword
  if (firstNode.type === "Identifier" && firstNode.name === "auto") {
    return {
      ok: true,
      property: "margin-left",
      value: { kind: "keyword", value: "auto" },
      issues: [],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "margin-left",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<MarginLeftIR>;
}
