// b_path:: packages/b_declarations/src/properties/animation-direction/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { AnimationDirectionIR } from "./types";

export function parseAnimationDirection(ast: csstree.Value): ParseResult<AnimationDirectionIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-direction",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for animation-direction",
        },
      ],
    };
  }

  if (firstNode.type === "Identifier") {
    const parsed = Keywords.animationDirectionKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "animation-direction",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "animation-direction",
    value: undefined,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: "Invalid animation-direction value",
      },
    ],
  };
}
