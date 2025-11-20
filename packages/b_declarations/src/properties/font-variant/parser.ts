// b_path:: packages/b_declarations/src/properties/font-variant/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontVariantIR } from "./types";

export function parseFontVariant(ast: csstree.Value): ParseResult<FontVariantIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-variant",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-variant" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-variant",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const parsed = Keywords.fontVariantKeywordSchema.safeParse(name);
    if (parsed.success) {
      return {
        ok: true,
        property: "font-variant",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "font-variant",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid font-variant value" }],
  };
}
