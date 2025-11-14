// b_path:: packages/b_declarations/src/properties/animation-play-state/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { AnimationPlayStateIR } from "./types";

export function parseAnimationPlayState(ast: csstree.Value): ParseResult<AnimationPlayStateIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-play-state",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for animation-play-state",
        },
      ],
    };
  }

  if (firstNode.type === "Identifier") {
    const parsed = Keywords.animationPlayStateKeywordSchema.safeParse(firstNode.name);
    if (parsed.success) {
      return {
        ok: true,
        property: "animation-play-state",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "animation-play-state",
    value: undefined,
    issues: [
      {
        code: "invalid-value",
        severity: "error",
        message: "Invalid animation-play-state value",
      },
    ],
  };
}
