// b_path:: packages/b_declarations/src/properties/transform-origin/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { TransformOriginIR } from "./types";

export function parseTransformOrigin(ast: csstree.Value): ParseResult<TransformOriginIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "transform-origin",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for transform-origin" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "transform-origin",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }
  }

  const nodes = Array.from(ast.children);
  const positionResult = Parsers.Position.parsePosition2D(nodes, 0);

  if (positionResult.ok) {
    return {
      ok: true,
      property: "transform-origin",
      value: { kind: "position", value: positionResult.value.position },
      issues: positionResult.issues,
    };
  }

  return {
    ok: false,
    property: "transform-origin",
    value: undefined,
    issues: positionResult.issues,
  };
}
