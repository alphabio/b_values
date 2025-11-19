// b_path:: packages/b_declarations/src/properties/animation-delay/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
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

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "animation-delay",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "animation-delay",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<AnimationDelayIR>;
}
