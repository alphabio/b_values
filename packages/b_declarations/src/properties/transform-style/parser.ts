// b_path:: packages/b_declarations/src/properties/transform-style/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { TransformStyleIR } from "./types";

export function parseTransformStyle(ast: csstree.Value): ParseResult<TransformStyleIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "transform-style",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for transform-style",
        },
      ],
    };
  }

  if (firstNode.type === "Identifier") {
    const parsed = Keywords.transformStyleKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "transform-style",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "transform-style",
    value: undefined,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: "Invalid transform-style value",
      },
    ],
  };
}
