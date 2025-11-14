// b_path:: packages/b_declarations/src/properties/animation-name/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { AnimationNameIR } from "./types";

export function parseAnimationName(ast: csstree.Value): ParseResult<AnimationNameIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "animation-name",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for animation-name" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    // CSS-wide keywords
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "animation-name",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    // Special keyword for animation-name
    if (name === "none") {
      return {
        ok: true,
        property: "animation-name",
        value: { kind: "keyword", value: name },
        issues: [],
      };
    }

    // Custom identifier (animation name)
    return {
      ok: true,
      property: "animation-name",
      value: { kind: "custom-ident", value: firstNode.name },
      issues: [],
    };
  }

  return {
    ok: false,
    property: "animation-name",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid animation-name value" }],
  };
}
