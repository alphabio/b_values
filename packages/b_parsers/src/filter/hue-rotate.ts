// b_path:: packages/b_parsers/src/filter/hue-rotate.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseAngleNode } from "../angle";

/**
 * Parse hue-rotate filter function from css-tree AST
 * @see https://drafts.fxtf.org/filter-effects/#funcdef-filter-hue-rotate
 */

export function parseHueRotateFunction(node: csstree.FunctionNode): ParseResult<Type.HueRotateFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName !== "hue-rotate") {
    return parseErr("filter", createError("unsupported-kind", `Expected hue-rotate function, got ${funcName}`));
  }

  if (args.length === 0) {
    return parseOk({ kind: "hue-rotate" });
  }

  if (args.length !== 1) {
    return parseErr("filter", createError("invalid-syntax", "hue-rotate() requires 0 or 1 argument"));
  }

  const angleResult = parseAngleNode(args[0]);
  if (!angleResult.ok) {
    return parseErr("filter", angleResult.issues[0] ?? createError("invalid-value", "Invalid angle"));
  }

  return parseOk({ kind: "hue-rotate", angle: angleResult.value });
}
