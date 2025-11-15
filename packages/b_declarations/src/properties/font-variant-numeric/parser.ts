// b_path:: packages/b_declarations/src/properties/font-variant-numeric/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import type * as csstree from "@eslint/css-tree";
import type { FontVariantNumericIR } from "./types";

const VALID_NUMERIC = [
  "normal",
  "lining-nums",
  "oldstyle-nums",
  "proportional-nums",
  "tabular-nums",
  "diagonal-fractions",
  "stacked-fractions",
  "ordinal",
  "slashed-zero",
] as const;

export function parseFontVariantNumeric(ast: csstree.Value): ParseResult<FontVariantNumericIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return {
      ok: false,
      property: "font-variant-numeric",
      value: undefined,
      issues: [{ code: "missing-value", severity: "error", message: "Empty value for font-variant-numeric" }],
    };
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return {
        ok: true,
        property: "font-variant-numeric",
        value: { kind: "keyword", value: cssWideResult.data },
        issues: [],
      };
    }

    if (VALID_NUMERIC.includes(name as (typeof VALID_NUMERIC)[number])) {
      return {
        ok: true,
        property: "font-variant-numeric",
        value: { kind: "keyword", value: name as FontVariantNumericIR["value"] },
        issues: [],
      };
    }
  }

  return {
    ok: false,
    property: "font-variant-numeric",
    value: undefined,
    issues: [{ code: "invalid-value", severity: "error", message: "Invalid font-variant-numeric value" }],
  };
}
