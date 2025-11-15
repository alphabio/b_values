// b_path:: packages/b_declarations/src/properties/font-size/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { FontSizeIR } from "./types";

export function parseFontSize(ast: csstree.Value): ParseResult<FontSizeIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-size",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-size" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-size",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const absoluteResult = Keywords.absoluteSizeSchema.safeParse(name);
    if (absoluteResult.success) {
      return {
        ok: true,
        property: "font-size",
        value: { kind: "keyword", value: absoluteResult.data },
        issues: [],
      };
    }

    const relativeResult = Keywords.relativeSizeSchema.safeParse(name);
    if (relativeResult.success) {
      return {
        ok: true,
        property: "font-size",
        value: { kind: "keyword", value: relativeResult.data },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "font-size",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<FontSizeIR>;
}
