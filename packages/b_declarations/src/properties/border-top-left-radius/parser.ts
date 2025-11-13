// b_path:: packages/b_declarations/src/properties/border-top-left-radius/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BorderTopLeftRadiusIR } from "./types";

export function parseBorderTopLeftRadius(ast: csstree.Value): ParseResult<BorderTopLeftRadiusIR> {
  const nodes = Array.from(ast.children);

  if (nodes.length === 0) {
    return {
      ok: false,
      property: "border-top-left-radius",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for border-top-left-radius" }],
    };
  }

  // Parse first value (horizontal radius)
  const firstResult = Parsers.Utils.parseNodeToCssValue(nodes[0]);
  if (!firstResult.ok) {
    return firstResult as ParseResult<BorderTopLeftRadiusIR>;
  }

  // Single value = circular radius
  if (nodes.length === 1) {
    return {
      ok: true,
      property: "border-top-left-radius",
      value: { kind: "circular", radius: firstResult.value },
      issues: [],
    };
  }

  // Two values = elliptical (horizontal, vertical)
  const secondResult = Parsers.Utils.parseNodeToCssValue(nodes[1]);
  if (!secondResult.ok) {
    return secondResult as ParseResult<BorderTopLeftRadiusIR>;
  }

  return {
    ok: true,
    property: "border-top-left-radius",
    value: {
      kind: "elliptical",
      horizontal: firstResult.value,
      vertical: secondResult.value,
    },
    issues: [],
  };
}
