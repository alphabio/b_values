// b_path:: packages/b_declarations/src/properties/animation-duration/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
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

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "animation-duration",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "animation-duration",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<AnimationDurationIR>;
}
