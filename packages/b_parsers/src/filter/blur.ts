// b_path:: packages/b_parsers/src/filter/blur.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseLengthNode } from "../length";

/**
 * Parse blur filter function from css-tree AST
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-blur
 */

export function parseBlurFunction(node: csstree.FunctionNode): ParseResult<Type.BlurFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName !== "blur") {
    return parseErr("filter", createError("unsupported-kind", `Expected blur function, got ${funcName}`));
  }

  if (args.length === 0) {
    return parseOk({ kind: "blur" });
  }

  if (args.length !== 1) {
    return parseErr("filter", createError("invalid-syntax", "blur() requires 0 or 1 argument"));
  }

  const lengthResult = parseLengthNode(args[0]);
  if (!lengthResult.ok) {
    return parseErr("filter", lengthResult.issues[0] ?? createError("invalid-value", "Invalid length"));
  }

  return parseOk({ kind: "blur", length: lengthResult.value });
}
