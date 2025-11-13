// b_path:: packages/b_declarations/src/properties/padding-bottom/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { PaddingBottomIR } from "./types";

export function parsePaddingBottom(ast: csstree.Value): ParseResult<PaddingBottomIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "padding-bottom",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for padding-bottom" }],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "padding-bottom",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<PaddingBottomIR>;
}
