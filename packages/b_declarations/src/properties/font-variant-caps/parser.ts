// b_path:: packages/b_declarations/src/properties/font-variant-caps/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontVariantCapsIR } from "./types";

const VALID_CAPS = [
  "normal",
  "small-caps",
  "all-small-caps",
  "petite-caps",
  "all-petite-caps",
  "unicase",
  "titling-caps",
] as const;

export function parseFontVariantCaps(ast: csstree.Value): ParseResult<FontVariantCapsIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-variant-caps",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-variant-caps" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-variant-caps",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (VALID_CAPS.includes(name as (typeof VALID_CAPS)[number])) {
      return {
        ok: true,
        property: "font-variant-caps",
        value: { kind: "keyword", value: name as FontVariantCapsIR["value"] },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "font-variant-caps",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid font-variant-caps value" }],
  };
}
