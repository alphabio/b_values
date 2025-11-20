// b_path:: packages/b_declarations/src/properties/word-spacing/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { WordSpacingIR } from "./types";

export function parseWordSpacing(ast: csstree.Value): ParseResult<WordSpacingIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "word-spacing",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for word-spacing" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "word-spacing",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (name === "normal") {
      return {
        ok: true,
        property: "word-spacing",
        value: { kind: "keyword", value: "normal" },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "word-spacing",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<WordSpacingIR>;
}
