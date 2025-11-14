// b_path:: packages/b_declarations/src/properties/visibility/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { VisibilityIR } from "./types";

export function parseVisibility(ast: csstree.Value): ParseResult<VisibilityIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "visibility",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for visibility",
        },
      ],
    };
  }

  if (firstNode.type === "Identifier") {
    const parsed = Keywords.visibilityKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "visibility",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "visibility",
    value: undefined,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: "Invalid visibility value",
      },
    ],
  };
}
