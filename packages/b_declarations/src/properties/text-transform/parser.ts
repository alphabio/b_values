// b_path:: packages/b_declarations/src/properties/text-transform/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { TextTransformIR } from "./types";

export function parseTextTransform(ast: csstree.Value): ParseResult<TextTransformIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "text-transform",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for text-transform" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "text-transform",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const parsed = Keywords.textTransformKeywordSchema.safeParse(name);
    if (parsed.success) {
      return {
        ok: true,
        property: "text-transform",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "text-transform",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid text-transform value" }],
  };
}
