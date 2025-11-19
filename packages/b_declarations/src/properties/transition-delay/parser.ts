// b_path:: packages/b_declarations/src/properties/transition-delay/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
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

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "transition-delay",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "transition-delay",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<TransitionDelayIR>;
}
