// b_path:: packages/b_declarations/src/properties/background-position-x/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundPositionXIR } from "./types";

export function parseBackgroundPositionX(ast: csstree.Value): ParseResult<BackgroundPositionXIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "background-position-x",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for background-position-x" }],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "background-position-x",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<BackgroundPositionXIR>;
}
