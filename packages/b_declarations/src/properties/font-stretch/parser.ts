// b_path:: packages/b_declarations/src/properties/font-stretch/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontStretchIR } from "./types";

export function parseFontStretch(ast: csstree.Value): ParseResult<FontStretchIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-stretch",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-stretch" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-stretch",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const parsed = Keywords.fontStretchKeywordSchema.safeParse(name);
    if (parsed.success) {
      return {
        ok: true,
        property: "font-stretch",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "font-stretch",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid font-stretch value" }],
  };
}
