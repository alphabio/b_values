// b_path:: packages/b_declarations/src/properties/border-bottom-right-radius/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BorderBottomRightRadiusIR } from "./types";

export function parseBorderBottomRightRadius(ast: csstree.Value): ParseResult<BorderBottomRightRadiusIR> {
  const nodes = Array.from(ast.children);

  if (nodes.length === 0) {
    return {
      ok: false,
      property: "border-bottom-right-radius",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-bottom-right-radius" }],
    };
  }

  // Parse first value (horizontal radius)
  const firstResult = Parsers.Utils.parseNodeToCssValue(nodes[0]);
  if (!firstResult.ok) {
    return firstResult as ParseResult<BorderBottomRightRadiusIR>;
  }

  // Single value = circular radius
  if (nodes.length === 1) {
    return {
      ok: true,
      property: "border-bottom-right-radius",
      value: { kind: "circular", radius: firstResult.value },
      issues: [],
    };
  }

  // Two values = elliptical (horizontal, vertical)
  const secondResult = Parsers.Utils.parseNodeToCssValue(nodes[1]);
  if (!secondResult.ok) {
    return secondResult as ParseResult<BorderBottomRightRadiusIR>;
  }

  return {
    ok: true,
    property: "border-bottom-right-radius",
    value: {
      kind: "elliptical",
      horizontal: firstResult.value,
      vertical: secondResult.value,
    },
    issues: [],
  };
}
