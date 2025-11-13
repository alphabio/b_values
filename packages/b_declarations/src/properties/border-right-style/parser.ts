// b_path:: packages/b_declarations/src/properties/border-right-style/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { BorderRightStyleIR } from "./types";

export function parseBorderRightStyle(ast: csstree.Value): ParseResult<BorderRightStyleIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "border-right-style",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-right-style" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const parsed = Keywords.borderStyleKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "border-right-style",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "border-right-style",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid border-style value" }],
  };
}
