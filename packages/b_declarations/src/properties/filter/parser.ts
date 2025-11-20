// b_path:: packages/b_declarations/src/properties/filter/parser.ts

import type { ParseResult } from "@b/types";
import * as Keywords from "@b/keywords";
import * as Parsers from "@b/parsers";
import type * as csstree from "@eslint/css-tree";
import type { FilterIR } from "./types";
import { createError, parseErr, parseOk } from "@b/types";

export function parseFilter(ast: csstree.Value): ParseResult<FilterIR> {
  const firstNode = ast.children.first;

  if (!firstNode) {
    return parseErr("filter", createError("missing-value", "Empty value for filter"));
  }

  if (firstNode.type === "Identifier") {
    const name = firstNode.name.toLowerCase();

    const cssWideResult = Keywords.cssWide.safeParse(name);
    if (cssWideResult.success) {
      return { ok: true, property: "filter", value: { kind: "keyword", value: cssWideResult.data }, issues: [] };
    }

    const noneResult = Keywords.none.safeParse(name);
    if (noneResult.success) {
      return parseOk({ kind: "keyword", value: "none" });
    }
  }

  // Try filter list first (more specific than generic css-value)
  const filterListResult = Parsers.Filter.parseFilterList(ast);
  if (filterListResult.ok) {
    return parseOk({ kind: "filter-list", value: filterListResult.value });
  }

  // Fallback to universal CSS functions (var, calc, etc.)
  if (firstNode.type === "Function") {
    const cssValueResult = Parsers.Utils.parseNodeToCssValue(firstNode);
    if (cssValueResult.ok) {
      return parseOk({ kind: "css-value", value: cssValueResult.value });
    }
  }

  return parseErr("filter", filterListResult.issues[0] ?? createError("invalid-value", "Invalid filter value"));
}
