// b_path:: packages/b_parsers/src/transform/scale.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";

/**
 * Parse scale functions from css-tree AST
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-scale
 */

function parseNumber(node: csstree.CssNode): ParseResult<number> {
  if (node.type !== "Number") {
    return parseErr("transform", createError("invalid-syntax", "Expected number"));
  }
  const num = Number.parseFloat(node.value);
  if (Number.isNaN(num)) {
    return parseErr("transform", createError("invalid-value", "Invalid number"));
  }
  return parseOk(num);
}

export function parseScaleFunction(node: csstree.FunctionNode): ParseResult<Type.ScaleFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName === "scale") {
    if (args.length < 1) {
      return parseErr("transform", createError("invalid-syntax", "scale() requires at least 1 argument"));
    }

    const xResult = parseNumber(args[0]);
    if (!xResult.ok) {
      return parseErr("transform", xResult.issues[0] ?? createError("invalid-value", "Invalid x value"));
    }

    // Y defaults to x if not provided
    const y = args.length >= 2 ? parseNumber(args[1]) : xResult;
    if (!y.ok) {
      return parseErr("transform", y.issues[0] ?? createError("invalid-value", "Invalid y value"));
    }

    return parseOk({
      kind: "scale",
      x: xResult.value,
      y: y.value,
    });
  }

  if (funcName === "scalex") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "scaleX() requires 1 argument"));
    }
    const xResult = parseNumber(args[0]);
    if (!xResult.ok) {
      return parseErr("transform", xResult.issues[0] ?? createError("invalid-value", "Invalid x value"));
    }
    return parseOk({
      kind: "scaleX",
      x: xResult.value,
    });
  }

  if (funcName === "scaley") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "scaleY() requires 1 argument"));
    }
    const yResult = parseNumber(args[0]);
    if (!yResult.ok) {
      return parseErr("transform", yResult.issues[0] ?? createError("invalid-value", "Invalid y value"));
    }
    return parseOk({
      kind: "scaleY",
      y: yResult.value,
    });
  }

  if (funcName === "scalez") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "scaleZ() requires 1 argument"));
    }
    const zResult = parseNumber(args[0]);
    if (!zResult.ok) {
      return parseErr("transform", zResult.issues[0] ?? createError("invalid-value", "Invalid z value"));
    }
    return parseOk({
      kind: "scaleZ",
      z: zResult.value,
    });
  }

  if (funcName === "scale3d") {
    if (args.length !== 3) {
      return parseErr("transform", createError("invalid-syntax", "scale3d() requires 3 arguments"));
    }

    const xResult = parseNumber(args[0]);
    const yResult = parseNumber(args[1]);
    const zResult = parseNumber(args[2]);

    if (!xResult.ok || !yResult.ok || !zResult.ok) {
      return parseErr("transform", createError("invalid-value", "Invalid scale3d arguments"));
    }

    return parseOk({
      kind: "scale3d",
      x: xResult.value,
      y: yResult.value,
      z: zResult.value,
    });
  }

  return parseErr("transform", createError("unsupported-kind", `Unsupported scale function: ${funcName}`));
}
