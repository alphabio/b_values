// b_path:: packages/b_declarations/src/properties/text-indent/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { TextIndentIR } from "./types";

export function parseTextIndent(ast: csstree.Value): ParseResult<TextIndentIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "text-indent",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for text-indent" }],
    };
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "text-indent",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<TextIndentIR>;
}
