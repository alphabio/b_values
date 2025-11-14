// b_path:: packages/b_declarations/src/properties/animation-fill-mode/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { AnimationFillModeIR } from "./types";

export function parseAnimationFillMode(ast: csstree.Value): ParseResult<AnimationFillModeIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-fill-mode",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for animation-fill-mode",
        },
      ],
    };
  }

  if (firstNode.type === "Identifier") {
    const parsed = Keywords.animationFillModeKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "animation-fill-mode",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "animation-fill-mode",
    value: undefined,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: "Invalid animation-fill-mode value",
      },
    ],
  };
}
