// b_path:: packages/b_declarations/src/properties/font-variant-ligatures/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontVariantLigaturesIR } from "./types";

const VALID_LIGATURES = [
  "normal",
  "none",
  "common-ligatures",
  "no-common-ligatures",
  "discretionary-ligatures",
  "no-discretionary-ligatures",
  "historical-ligatures",
  "no-historical-ligatures",
  "contextual",
  "no-contextual",
] as const;

export function parseFontVariantLigatures(ast: csstree.Value): ParseResult<FontVariantLigaturesIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-variant-ligatures",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-variant-ligatures" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-variant-ligatures",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (VALID_LIGATURES.includes(name as (typeof VALID_LIGATURES)[number])) {
      return {
        ok: true,
        property: "font-variant-ligatures",
        value: { kind: "keyword", value: name as FontVariantLigaturesIR["value"] },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "font-variant-ligatures",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid font-variant-ligatures value" }],
  };
}
