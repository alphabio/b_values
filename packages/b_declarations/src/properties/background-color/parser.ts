// b_path:: packages/b_declarations/src/properties/background-color/parser.ts

import type { ParseResult } from "@b/types";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { BackgroundColorIR } from "./types";

export function parseBackgroundColor(ast: csstree.Value): ParseResult<BackgroundColorIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "background-color",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for background-color" }],
    };
  }

  const colorResult = Parsers.Color.parseNode(firstNode);

  if (colorResult.ok) {
    return {
      ok: true,
      property: "background-color",
      value: { kind: "value", value: colorResult.value },
      issues: colorResult.issues,
    };
  }

  return colorResult as ParseResult<BackgroundColorIR>;
}
