// b_path:: packages/b_declarations/src/properties/text-align/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { TextAlignIR } from "./types";

export function parseTextAlign(ast: csstree.Value): ParseResult<TextAlignIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "text-align",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for text-align" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "text-align",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const parsed = Keywords.textAlignKeywordSchema.safeParse(name);
    if (parsed.success) {
      return {
        ok: true,
        property: "text-align",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "text-align",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid text-align value" }],
  };
}
