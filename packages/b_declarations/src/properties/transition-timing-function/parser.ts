// b_path:: packages/b_declarations/src/properties/transition-timing-function/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { TransitionTimingFunctionIR } from "./types";

export function parseTransitionTimingFunction(ast: csstree.Value): ParseResult<TransitionTimingFunctionIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "transition-timing-function",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for transition-timing-function" }],
    };
  }

  const easingResult = Parsers.EasingFunction.parseEasingFunctionNode(firstNode);

  if (easingResult.ok) {
    return {
      ok: true,
      property: "transition-timing-function",
      value: { kind: "value", value: easingResult.value },
      issues: easingResult.issues,
    };
  }

  return easingResult as ParseResult<TransitionTimingFunctionIR>;
}
