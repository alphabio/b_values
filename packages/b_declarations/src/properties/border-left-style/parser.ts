// b_path:: packages/b_declarations/src/properties/border-left-style/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { BorderLeftStyleIR } from "./types";

export function parseBorderLeftStyle(ast: csstree.Value): ParseResult<BorderLeftStyleIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "border-left-style",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-left-style" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const parsed = Keywords.borderStyleKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "border-left-style",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "border-left-style",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid border-style value" }],
  };
}
