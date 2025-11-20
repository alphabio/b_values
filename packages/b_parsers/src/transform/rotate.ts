// b_path:: packages/b_parsers/src/transform/rotate.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNodeToCssValue } from "../utils/css-value-parser";

/**
 * Parse rotate functions from css-tree AST
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-rotate
 */

export function parseRotateFunction(node: csstree.FunctionNode): ParseResult<Type.RotateFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName === "rotate") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "rotate() requires 1 argument"));
    }
    const angleResult = parseNodeToCssValue(args[0]);
    if (!angleResult.ok) {
      return parseErr("transform", angleResult.issues[0] ?? createError("invalid-value", "Invalid angle"));
    }
    return parseOk({
      kind: "rotate",
      angle: angleResult.value,
    });
  }

  if (funcName === "rotatex") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "rotateX() requires 1 argument"));
    }
    const angleResult = parseNodeToCssValue(args[0]);
    if (!angleResult.ok) {
      return parseErr("transform", angleResult.issues[0] ?? createError("invalid-value", "Invalid angle"));
    }
    return parseOk({
      kind: "rotateX",
      angle: angleResult.value,
    });
  }

  if (funcName === "rotatey") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "rotateY() requires 1 argument"));
    }
    const angleResult = parseNodeToCssValue(args[0]);
    if (!angleResult.ok) {
      return parseErr("transform", angleResult.issues[0] ?? createError("invalid-value", "Invalid angle"));
    }
    return parseOk({
      kind: "rotateY",
      angle: angleResult.value,
    });
  }

  if (funcName === "rotatez") {
    if (args.length !== 1) {
      return parseErr("transform", createError("invalid-syntax", "rotateZ() requires 1 argument"));
    }
    const angleResult = parseNodeToCssValue(args[0]);
    if (!angleResult.ok) {
      return parseErr("transform", angleResult.issues[0] ?? createError("invalid-value", "Invalid angle"));
    }
    return parseOk({
      kind: "rotateZ",
      angle: angleResult.value,
    });
  }

  if (funcName === "rotate3d") {
    if (args.length !== 4) {
      return parseErr("transform", createError("invalid-syntax", "rotate3d() requires 4 arguments"));
    }

    // Parse x, y, z as numbers
    const parseNumber = (node: csstree.CssNode): ParseResult<number> => {
      if (node.type !== "Number") {
        return parseErr("transform", createError("invalid-syntax", "Expected number"));
      }
      const num = Number.parseFloat(node.value);
      if (Number.isNaN(num)) {
        return parseErr("transform", createError("invalid-value", "Invalid number"));
      }
      return parseOk(num);
    };

    const xResult = parseNumber(args[0]);
    const yResult = parseNumber(args[1]);
    const zResult = parseNumber(args[2]);
    const angleResult = parseNodeToCssValue(args[3]);

    if (!xResult.ok || !yResult.ok || !zResult.ok || !angleResult.ok) {
      return parseErr("transform", createError("invalid-value", "Invalid rotate3d arguments"));
    }

    return parseOk({
      kind: "rotate3d",
      x: xResult.value,
      y: yResult.value,
      z: zResult.value,
      angle: angleResult.value,
    });
  }

  return parseErr("transform", createError("unsupported-kind", `Unsupported rotate function: ${funcName}`));
}
