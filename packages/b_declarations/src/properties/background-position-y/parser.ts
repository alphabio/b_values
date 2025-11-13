// b_path:: packages/b_declarations/src/properties/background-position-y/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundPositionYIR } from "./types";

export function parseBackgroundPositionY(ast: csstree.Value): ParseResult<BackgroundPositionYIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "background-position-y",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for background-position-y" }],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "background-position-y",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<BackgroundPositionYIR>;
}
