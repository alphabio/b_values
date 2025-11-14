// b_path:: packages/b_parsers/src/transform/matrix.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";

/**
 * Parse matrix functions from css-tree AST
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-matrix
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

export function parseMatrixFunction(node: csstree.FunctionNode): ParseResult<Type.MatrixFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName === "matrix") {
    if (args.length !== 6) {
      return parseErr("transform", createError("invalid-syntax", "matrix() requires 6 arguments"));
    }

    const results = args.map(parseNumber);
    if (results.some((r) => !r.ok)) {
      return parseErr("transform", createError("invalid-value", "Invalid matrix arguments"));
    }

    const [a, b, c, d, e, f] = results.map((r) => (r as { ok: true; value: number }).value);

    return parseOk({
      kind: "matrix",
      a: a!,
      b: b!,
      c: c!,
      d: d!,
      e: e!,
      f: f!,
    });
  }

  if (funcName === "matrix3d") {
    if (args.length !== 16) {
      return parseErr("transform", createError("invalid-syntax", "matrix3d() requires 16 arguments"));
    }

    const results = args.map(parseNumber);
    if (results.some((r) => !r.ok)) {
      return parseErr("transform", createError("invalid-value", "Invalid matrix3d arguments"));
    }

    const values = results.map((r) => (r as { ok: true; value: number }).value) as [
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
      number,
    ];

    return parseOk({
      kind: "matrix3d",
      values,
    });
  }

  return parseErr("transform", createError("unsupported-kind", `Unsupported matrix function: ${funcName}`));
}
