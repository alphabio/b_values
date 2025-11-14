// b_path:: packages/b_parsers/src/transform/skew.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseAngleNode } from "../angle";

/**
 * Parse skew functions from css-tree AST
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-skew
 */

export function parseSkewFunction(node: csstree.FunctionNode): ParseResult<Type.SkewFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName === "skew") {
    if (args.length < 1 || args.length > 2) {
      return parseErr("transform", createError("invalid-syntax", "skew() requires 1-2 arguments"));
    }

    const xResult = parseAngleNode(args[0]);
    if (!xResult.ok) {
      return parseErr("transform", xResult.issues[0] ?? createError("invalid-value", "Invalid x angle"));
    }

    // Y defaults to 0deg if not provided
    let y: Type.Angle = { value: 0, unit: "deg" };
    if (args.length === 2) {
      const yResult = parseAngleNode(args[1]);
      if (!yResult.ok) {
        return parseErr("transform", yResult.issues[0] ?? createError("invalid-value", "Invalid y angle"));
      }
      y = yResult.value;
    }

    return parseOk({
      kind: "skew",
      x: xResult.value,
      y,
    });
  }

  if (funcName === "skewx") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "skewX() requires 1 argument"));
    }
    const xResult = parseAngleNode(args[0]);
    if (!xResult.ok) {
      return parseErr("transform", xResult.issues[0] ?? createError("invalid-value", "Invalid x angle"));
    }
    return parseOk({
      kind: "skewX",
      x: xResult.value,
    });
  }

  if (funcName === "skewy") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "skewY() requires 1 argument"));
    }
    const yResult = parseAngleNode(args[0]);
    if (!yResult.ok) {
      return parseErr("transform", yResult.issues[0] ?? createError("invalid-value", "Invalid y angle"));
    }
    return parseOk({
      kind: "skewY",
      y: yResult.value,
    });
  }

  return parseErr("transform", createError("unsupported-kind", `Unsupported skew function: ${funcName}`));
}
