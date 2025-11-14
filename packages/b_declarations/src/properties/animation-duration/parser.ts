// b_path:: packages/b_declarations/src/properties/animation-duration/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { AnimationDurationIR } from "./types";

export function parseAnimationDuration(ast: csstree.Value): ParseResult<AnimationDurationIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-duration",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for animation-duration",
        },
      ],
    };
  }

  const timeResult = Parsers.Time.parseTimeNode(firstNode);

  if (timeResult.ok) {
    return {
      ok: true,
      property: "animation-duration",
      value: { kind: "value", value: timeResult.value },
      issues: timeResult.issues,
    };
  }

  return timeResult as ParseResult<AnimationDurationIR>;
}
