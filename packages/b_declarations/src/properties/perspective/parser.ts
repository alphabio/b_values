// b_path:: packages/b_declarations/src/properties/perspective/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { PerspectiveIR } from "./types";

export function parsePerspective(ast: csstree.Value): ParseResult<PerspectiveIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "perspective",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for perspective" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "perspective",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const noneResult = Keywords.none.safeParse(name);
    if (noneResult.success) {
      return {
        ok: true,
        property: "perspective",
        value: { kind: "keyword", value: "none" },
        issues: [],
      };
    }
  }

  const valueResult = Parsers.Utils.parseNodeToCssValue(firstNode);

  if (valueResult.ok) {
    return {
      ok: true,
      property: "perspective",
      value: { kind: "value", value: valueResult.value },
      issues: valueResult.issues,
    };
  }

  return valueResult as ParseResult<PerspectiveIR>;
}
