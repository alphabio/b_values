// b_path:: packages/b_declarations/src/properties/animation-iteration-count/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { AnimationIterationCountIR } from "./types";

export function parseAnimationIterationCount(ast: csstree.Value): ParseResult<AnimationIterationCountIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-iteration-count",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for animation-iteration-count",
        },
      ],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "animation-iteration-count",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (name === "infinite") {
      return {
        ok: true,
        property: "animation-iteration-count",
        value: { kind: "keyword", value: "infinite" },
        issues: [],
      };
    }
  }

  if (firstNode.type === "Number") {
    const num = Number.parseFloat(firstNode.value);

    if (Number.isNaN(num) || num < 0) {
      return {
        ok: false,
        property: "animation-iteration-count",
        value: undefined,
        issues: [
          {
            code: "invalid-value",
            severity: "error",
            message: "animation-iteration-count must be a non-negative number",
          },
        ],
      };
    }

    return {
      ok: true,
      property: "animation-iteration-count",
      value: { kind: "number", value: num },
      issues: [],
    };
  }

  return {
    ok: false,
    property: "animation-iteration-count",
    value: undefined,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: "Invalid animation-iteration-count value",
      },
    ],
  };
}
