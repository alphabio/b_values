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

  // Try concrete Time first
  const timeResult = Parsers.Time.parseTimeNode(firstNode);
  if (timeResult.ok) {
    return {
      ok: true,
      property: "animation-duration",
      value: { kind: "time", value: timeResult.value },
      issues: timeResult.issues,
    };
  }

  // Fallback to CssValue (var, calc, etc.)
  const cssValueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
  if (cssValueResult.ok) {
    return {
      ok: true,
      property: "animation-duration",
      value: { kind: "value", value: cssValueResult.value },
      issues: cssValueResult.issues,
    };
  }

  return cssValueResult as ParseResult<AnimationDurationIR>;
}
