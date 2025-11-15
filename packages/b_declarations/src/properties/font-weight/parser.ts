// b_path:: packages/b_declarations/src/properties/font-weight/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontWeightIR } from "./types";

export function parseFontWeight(ast: csstree.Value): ParseResult<FontWeightIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-weight",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-weight" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-weight",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const parsed = Keywords.fontWeightKeywordSchema.safeParse(name);
    if (parsed.success) {
      return {
        ok: true,
        property: "font-weight",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  if (firstNode.type === "Number") {
    const num = Number.parseFloat(firstNode.value);

    if (Number.isNaN(num)) {
      return {
        ok: false,
        property: "font-weight",
        value: undefined,
        issues: [
          {
            code: "invalid-value",
            severity: "error",
            message: "font-weight must be a valid number",
          },
        ],
      };
    }

    return {
      ok: true,
      property: "font-weight",
      value: { kind: "number", value: num },
      issues:
        num < 1 || num > 1000
          ? [
              {
                code: "invalid-value",
                severity: "warning",
                message: "font-weight should be between 1 and 1000",
              },
            ]
          : [],
    };
  }

  return {
    ok: false,
    property: "font-weight",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid font-weight value" }],
  };
}
