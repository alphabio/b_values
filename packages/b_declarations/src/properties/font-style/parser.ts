// b_path:: packages/b_declarations/src/properties/font-style/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parser from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { FontStyleIR } from "./types";

export function parseFontStyle(ast: csstree.Value): ParseResult<FontStyleIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-style",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-style" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-style",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (name === "normal" || name === "italic") {
      return {
        ok: true,
        property: "font-style",
        value: { kind: "keyword", value: name },
        issues: [],
      };
    }

    if (name === "oblique") {
      const secondNode = ast.children.toArray()[1];

      if (secondNode) {
        const angleResult = Parser.Angle.parseAngleNode(secondNode);
        if (angleResult.ok) {
          return {
            ok: true,
            property: "font-style",
            value: { kind: "oblique", angle: angleResult.value },
            issues: angleResult.issues,
          };
        }
      }

      return {
        ok: true,
        property: "font-style",
        value: { kind: "oblique" },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "font-style",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid font-style value" }],
  };
}
