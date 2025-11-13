// b_path:: packages/b_declarations/src/properties/padding-top/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { PaddingTopIR } from "./types";

export function parsePaddingTop(ast: csstree.Value): ParseResult<PaddingTopIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "padding-top",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for padding-top" }],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "padding-top",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<PaddingTopIR>;
}
