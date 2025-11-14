// b_path:: packages/b_parsers/src/easing-function.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import * as Keywords from "@b/keywords";

/**
 * Parse easing function AST node from css-tree.
 *
 * @see https://drafts.csswg.org/css-easing-1/#typedef-easing-function
 */
export function parseEasingFunctionNode(node: csstree.CssNode): ParseResult<Type.EasingFunction> {
  // Keyword easing functions
  if (node.type === "Identifier") {
    const parsed = Keywords.easingKeywordSchema.safeParse(node.name);
    if (parsed.success) {
      return parseOk({ kind: "keyword", value: parsed.data });
    }
    return parseErr("easing-function", createError("invalid-value", `Invalid easing keyword: '${node.name}'`));
  }

  // Function easing functions (cubic-bezier, steps)
  if (node.type === "Function") {
    const name = node.name.toLowerCase();

    if (name === "cubic-bezier") {
      return parseCubicBezier(node);
    }

    if (name === "steps") {
      return parseSteps(node);
    }

    return parseErr("easing-function", createError("invalid-value", `Invalid easing function: '${node.name}'`));
  }

  return parseErr(
    "easing-function",
    createError("invalid-syntax", `Expected easing function, but got node type ${node.type}`),
  );
}

function parseCubicBezier(node: csstree.FunctionNode): ParseResult<Type.EasingFunction> {
  const children = node.children.toArray();

  // Need exactly 4 number arguments
  const numbers: number[] = [];
  for (const child of children) {
    if (child.type === "Number") {
      const value = Number.parseFloat(child.value);
      if (Number.isNaN(value)) {
        return parseErr("easing-function", createError("invalid-value", "Invalid cubic-bezier parameter"));
      }
      numbers.push(value);
    }
  }

  if (numbers.length !== 4) {
    return parseErr(
      "easing-function",
      createError("invalid-value", `cubic-bezier requires 4 parameters, got ${numbers.length}`),
    );
  }

  return parseOk({
    kind: "cubic-bezier",
    x1: numbers[0],
    y1: numbers[1],
    x2: numbers[2],
    y2: numbers[3],
  });
}

function parseSteps(node: csstree.FunctionNode): ParseResult<Type.EasingFunction> {
  const children = node.children.toArray();

  let count: number | undefined;
  let position: Keywords.StepsPosition | undefined;

  for (const child of children) {
    if (child.type === "Number") {
      const value = Number.parseFloat(child.value);
      if (Number.isNaN(value) || !Number.isInteger(value) || value <= 0) {
        return parseErr("easing-function", createError("invalid-value", "Steps count must be a positive integer"));
      }
      count = value;
    } else if (child.type === "Identifier") {
      const parsed = Keywords.stepsPositionSchema.safeParse(child.name);
      if (parsed.success) {
        position = parsed.data;
      } else {
        return parseErr("easing-function", createError("invalid-value", `Invalid steps position: '${child.name}'`));
      }
    }
  }

  if (count === undefined) {
    return parseErr("easing-function", createError("invalid-value", "Steps function requires a count parameter"));
  }

  return parseOk({
    kind: "steps",
    count,
    ...(position !== undefined && { position }),
  });
}
