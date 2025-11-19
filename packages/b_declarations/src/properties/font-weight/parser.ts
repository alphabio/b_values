// b_path:: packages/b_declarations/src/properties/font-weight/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { FontWeightIR } from "./types";

export function parseFontWeight(ast: csstree.Value): ParseResult<FontWeightIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-weight",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-weight" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-weight",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const parsed = Keywords.fontWeightKeywordSchema.safeParse(name);
    if (parsed.success) {
      return {
        ok: true,
        property: "font-weight",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "font-weight",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<FontWeightIR>;
}
