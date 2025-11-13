// b_path:: packages/b_declarations/src/properties/border-bottom-left-radius/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BorderBottomLeftRadiusIR } from "./types";

export function parseBorderBottomLeftRadius(ast: csstree.Value): ParseResult<BorderBottomLeftRadiusIR> {
  const nodes = Array.from(ast.children);

  if (nodes.length === 0) {
    return {
      ok: false,
      property: "border-bottom-left-radius",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-bottom-left-radius" }],
    };
  }

  // Parse first value (horizontal radius)
  const firstResult = Parsers.Utils.parseNodeToCssValue(nodes[0]);
  if (!firstResult.ok) {
    return firstResult as ParseResult<BorderBottomLeftRadiusIR>;
  }

  // Single value = circular radius
  if (nodes.length === 1) {
    return {
      ok: true,
      property: "border-bottom-left-radius",
      value: { kind: "circular", radius: firstResult.value },
      issues: [],
    };
  }

  // Two values = elliptical (horizontal, vertical)
  const secondResult = Parsers.Utils.parseNodeToCssValue(nodes[1]);
  if (!secondResult.ok) {
    return secondResult as ParseResult<BorderBottomLeftRadiusIR>;
  }

  return {
    ok: true,
    property: "border-bottom-left-radius",
    value: {
      kind: "elliptical",
      horizontal: firstResult.value,
      vertical: secondResult.value,
    },
    issues: [],
  };
}
