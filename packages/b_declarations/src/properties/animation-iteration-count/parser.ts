// b_path:: packages/b_declarations/src/properties/animation-iteration-count/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { AnimationIterationCountIR } from "./types";

export function parseAnimationIterationCount(ast: csstree.Value): ParseResult<AnimationIterationCountIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-iteration-count",
      value: undefined,
      issues: [
        {
          code: "missing-value",
          severity: "error",
          message: "Empty value for animation-iteration-count",
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
        property: "animation-iteration-count",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (name === "infinite") {
      return {
        ok: true,
        property: "animation-iteration-count",
        value: { kind: "keyword", value: "infinite" },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "animation-iteration-count",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<AnimationIterationCountIR>;
}
