// b_path:: packages/b_declarations/src/properties/opacity/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { OpacityIR } from "./types";

export function parseOpacity(ast: csstree.Value): ParseResult<OpacityIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "opacity",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for opacity" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "opacity",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }
  }

  if (firstNode.type === "Number") {
    const num = Number.parseFloat(firstNode.value);

    if (Number.isNaN(num)) {
      return {
        ok: false,
        property: "opacity",
        value: undefined,
        issues: [
          {
            code: "invalid-value",
            severity: "error",
            message: "opacity must be a valid number",
          },
        ],
      };
    }

    return {
      ok: true,
      property: "opacity",
      value: { kind: "number", value: num },
      issues:
        num < 0 || num > 1
          ? [
              {
                code: "invalid-value",
                severity: "warning",
                message: "opacity should be between 0 and 1",
              },
            ]
          : [],
    };
  }

  return {
    ok: false,
    property: "opacity",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid opacity value" }],
  };
}
