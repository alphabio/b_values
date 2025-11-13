// b_path:: packages/b_declarations/src/properties/border-bottom-width/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { BorderBottomWidthIR } from "./types";

export function parseBorderBottomWidth(ast: csstree.Value): ParseResult<BorderBottomWidthIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "border-bottom-width",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-bottom-width" }],
    };
  }

  // Check for line-width keywords (thin | medium | thick)
  if (firstNode.type === "Identifier") {
    const parsed = Keywords.lineWidthKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "border-bottom-width",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "border-bottom-width",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<BorderBottomWidthIR>;
}
