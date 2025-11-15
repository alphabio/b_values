// b_path:: packages/b_declarations/src/properties/font-kerning/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontKerningIR } from "./types";

export function parseFontKerning(ast: csstree.Value): ParseResult<FontKerningIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-kerning",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-kerning" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-kerning",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (name === "auto" || name === "normal" || name === "none") {
      return {
        ok: true,
        property: "font-kerning",
        value: { kind: "keyword", value: name },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "font-kerning",
    value: undefined,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: "Invalid value for font-kerning: expected auto, normal, or none",
      },
    ],
  };
}
