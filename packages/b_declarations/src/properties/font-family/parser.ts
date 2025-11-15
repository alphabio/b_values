// b_path:: packages/b_declarations/src/properties/font-family/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontFamilyIR } from "./types";

export function parseFontFamily(ast: csstree.Value): ParseResult<FontFamilyIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-family",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-family" }],
    };
  }

  // Check for CSS-wide keywords first (single identifier)
  if (ast.children.size === 1 && firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();
    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-family",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }
  }

  // Parse comma-separated list of families
  const families: Array<Keywords.GenericFamily | string> = [];
  const nodes = ast.children.toArray();
  let currentFamily: string[] = [];

  for (let i = 0; i < nodes.length; i++) {
    const node = nodes[i];

    if (node.type === "Operator" && node.value === ",") {
      // End of current family
      if (currentFamily.length > 0) {
        const familyName = currentFamily.join(" ").trim();
        if (familyName) {
          // Check if it's a generic family
          const genericResult = Keywords.genericFamilySchema.safeParse(familyName.toLowerCase());
          families.push(genericResult.success ? genericResult.data : familyName);
        }
        currentFamily = [];
      }
    } else if (node.type === "Identifier") {
      currentFamily.push(node.name);
    } else if (node.type === "String") {
      // Quoted string - use as-is
      families.push(node.value);
      currentFamily = [];
    }
  }

  // Don't forget the last family
  if (currentFamily.length > 0) {
    const familyName = currentFamily.join(" ").trim();
    if (familyName) {
      const genericResult = Keywords.genericFamilySchema.safeParse(familyName.toLowerCase());
      families.push(genericResult.success ? genericResult.data : familyName);
    }
  }

  if (families.length === 0) {
    return {
      ok: false,
      property: "font-family",
      value: undefined,
      issues: [{ code: "invalid-value", severity: "error", message: "No valid font families found" }],
    };
  }

  return {
    ok: true,
    property: "font-family",
    value: { kind: "list", families },
    issues: [],
  };
}
