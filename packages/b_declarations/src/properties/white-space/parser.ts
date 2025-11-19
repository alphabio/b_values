// b_path:: packages/b_declarations/src/properties/white-space/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { WhiteSpaceIR } from "./types";

export function parseWhiteSpace(ast: csstree.Value): ParseResult<WhiteSpaceIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "white-space",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for white-space" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "white-space",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const parsed = Keywords.whiteSpaceKeywordSchema.safeParse(name);
    if (parsed.success) {
      return {
        ok: true,
        property: "white-space",
        value: { kind: "keyword", value: parsed.data },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "white-space",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid white-space value" }],
  };
}
