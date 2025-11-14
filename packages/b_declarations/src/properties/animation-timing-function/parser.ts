// b_path:: packages/b_declarations/src/properties/animation-timing-function/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { AnimationTimingFunctionIR } from "./types";

export function parseAnimationTimingFunction(ast: csstree.Value): ParseResult<AnimationTimingFunctionIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-timing-function",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for animation-timing-function",
        },
      ],
    };
  }

  const easingResult = Parsers.EasingFunction.parseEasingFunctionNode(firstNode);

  if (easingResult.ok) {
    return {
      ok: true,
      property: "animation-timing-function",
      value: { kind: "value", value: easingResult.value },
      issues: easingResult.issues,
    };
  }

  return easingResult as ParseResult<AnimationTimingFunctionIR>;
}
