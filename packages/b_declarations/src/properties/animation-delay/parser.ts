// b_path:: packages/b_declarations/src/properties/animation-delay/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { AnimationDelayIR } from "./types";

export function parseAnimationDelay(ast: csstree.Value): ParseResult<AnimationDelayIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-delay",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for animation-delay" }],
    };
  }

  const timeResult = Parsers.Time.parseTimeNode(firstNode);

  if (timeResult.ok) {
    return {
      ok: true,
      property: "animation-delay",
      value: { kind: "value", value: timeResult.value },
      issues: timeResult.issues,
    };
  }

  return timeResult as ParseResult<AnimationDelayIR>;
}
