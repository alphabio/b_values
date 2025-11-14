// b_path:: packages/b_declarations/src/properties/transition-property/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { TransitionPropertyIR } from "./types";

export function parseTransitionProperty(ast: csstree.Value): ParseResult<TransitionPropertyIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "transition-property",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for transition-property" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    // CSS-wide keywords
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "transition-property",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    // Special keywords for transition-property
    if (name === "none" || name === "all") {
      return {
        ok: true,
        property: "transition-property",
        value: { kind: "keyword", value: name },
        issues: [],
      };
    }

    // Custom identifier (property name)
    return {
      ok: true,
      property: "transition-property",
      value: { kind: "custom-ident", value: firstNode.name },
      issues: [],
    };
  }

  return {
    ok: false,
    property: "transition-property",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid transition-property value" }],
  };
}
