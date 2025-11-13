// b_path:: packages/b_declarations/src/properties/padding-right/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { PaddingRightIR } from "./types";

export function parsePaddingRight(ast: csstree.Value): ParseResult<PaddingRightIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "padding-right",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for padding-right" }],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "padding-right",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<PaddingRightIR>;
}
