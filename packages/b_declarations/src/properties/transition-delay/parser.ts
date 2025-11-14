// b_path:: packages/b_declarations/src/properties/transition-delay/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { TransitionDelayIR } from "./types";

export function parseTransitionDelay(ast: csstree.Value): ParseResult<TransitionDelayIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "transition-delay",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for transition-delay" }],
    };
  }

  const timeResult = Parsers.Time.parseTimeNode(firstNode);

  if (timeResult.ok) {
    return {
      ok: true,
      property: "transition-delay",
      value: { kind: "value", value: timeResult.value },
      issues: timeResult.issues,
    };
  }

  return timeResult as ParseResult<TransitionDelayIR>;
}
