// b_path:: packages/b_declarations/src/properties/padding-left/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { PaddingLeftIR } from "./types";

export function parsePaddingLeft(ast: csstree.Value): ParseResult<PaddingLeftIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "padding-left",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for padding-left" }],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "padding-left",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<PaddingLeftIR>;
}
