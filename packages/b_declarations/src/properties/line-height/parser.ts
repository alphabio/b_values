// b_path:: packages/b_declarations/src/properties/line-height/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { LineHeightIR } from "./types";

export function parseLineHeight(ast: csstree.Value): ParseResult<LineHeightIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "line-height",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for line-height" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "line-height",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (name === "normal") {
      return {
        ok: true,
        property: "line-height",
        value: { kind: "keyword", value: "normal" },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "line-height",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<LineHeightIR>;
}
