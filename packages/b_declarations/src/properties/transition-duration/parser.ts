// b_path:: packages/b_declarations/src/properties/transition-duration/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { TransitionDurationIR } from "./types";

export function parseTransitionDuration(ast: csstree.Value): ParseResult<TransitionDurationIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "transition-duration",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for transition-duration" }],
    };
  }

  const timeResult = Parsers.Time.parseTimeNode(firstNode);

  if (timeResult.ok) {
    return {
      ok: true,
      property: "transition-duration",
      value: { kind: "value", value: timeResult.value },
      issues: timeResult.issues,
    };
  }

  return timeResult as ParseResult<TransitionDurationIR>;
}
