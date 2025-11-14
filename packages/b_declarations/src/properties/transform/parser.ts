// b_path:: packages/b_declarations/src/properties/transform/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { TransformIR } from "./types";

export function parseTransform(ast: csstree.Value): ParseResult<TransformIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "transform",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for transform" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "transform",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    const noneResult = Keywords.none.safeParse(name);
    if (noneResult.success) {
      return {
        ok: true,
        property: "transform",
        value: { kind: "keyword", value: "none" },
        issues: [],
      };
    }
  }

  const transformListResult = Parsers.Transform.parseTransformList(ast);
  if (transformListResult.ok) {
    return {
      ok: true,
      property: "transform",
      value: { kind: "transform-list", value: transformListResult.value },
      issues: transformListResult.issues,
    };
  }

  return {
    ok: false,
    property: "transform",
    value: undefined,
    issues: transformListResult.issues,
  };
}
