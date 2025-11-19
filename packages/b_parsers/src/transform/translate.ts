// b_path:: packages/b_parsers/src/transform/translate.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNodeToCssValue } from "../utils/css-value-parser";

/**
 * Parse translate functions from css-tree AST
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-translate
 */

export function parseTranslateFunction(node: csstree.FunctionNode): ParseResult<Type.TranslateFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);

  // Filter out whitespace
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName === "translate") {
    // translate(x, y) - 2 args required
    if (args.length < 1) {
      return parseErr("transform", createError("invalid-syntax", "translate() requires at least 1 argument"));
    }

    const xResult = parseNodeToCssValue(args[0]);
    if (!xResult.ok) {
      return parseErr("transform", xResult.issues[0] ?? createError("invalid-value", "Invalid x value"));
    }

    // Y defaults to 0 if not provided
    let y: Type.CssValue = { kind: "literal", value: 0, unit: "px" };
    if (args.length >= 2) {
      const yResult = parseNodeToCssValue(args[1]);
      if (!yResult.ok) {
        return parseErr("transform", yResult.issues[0] ?? createError("invalid-value", "Invalid y value"));
      }
      y = yResult.value;
    }

    return parseOk({
      kind: "translate",
      x: xResult.value,
      y,
    });
  }

  if (funcName === "translatex") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "translateX() requires 1 argument"));
    }
    const xResult = parseNodeToCssValue(args[0]);
    if (!xResult.ok) {
      return parseErr("transform", xResult.issues[0] ?? createError("invalid-value", "Invalid x value"));
    }
    return parseOk({
      kind: "translateX",
      x: xResult.value,
    });
  }

  if (funcName === "translatey") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "translateY() requires 1 argument"));
    }
    const yResult = parseNodeToCssValue(args[0]);
    if (!yResult.ok) {
      return parseErr("transform", yResult.issues[0] ?? createError("invalid-value", "Invalid y value"));
    }
    return parseOk({
      kind: "translateY",
      y: yResult.value,
    });
  }

  if (funcName === "translatez") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "translateZ() requires 1 argument"));
    }
    const zResult = parseNodeToCssValue(args[0]);
    if (!zResult.ok) {
      return parseErr("transform", zResult.issues[0] ?? createError("invalid-value", "Invalid z value"));
    }
    return parseOk({
      kind: "translateZ",
      z: zResult.value,
    });
  }

  if (funcName === "translate3d") {
    if (args.length !== 3) {
      return parseErr("transform", createError("invalid-syntax", "translate3d() requires 3 arguments"));
    }
    const xResult = parseNodeToCssValue(args[0]);
    const yResult = parseNodeToCssValue(args[1]);
    const zResult = parseNodeToCssValue(args[2]);

    if (!xResult.ok || !yResult.ok || !zResult.ok) {
      return parseErr("transform", createError("invalid-value", "Invalid translate3d arguments"));
    }

    return parseOk({
      kind: "translate3d",
      x: xResult.value,
      y: yResult.value,
      z: zResult.value,
    });
  }

  return parseErr("transform", createError("unsupported-kind", `Unsupported translate function: ${funcName}`));
}
