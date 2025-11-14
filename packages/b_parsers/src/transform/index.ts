// b_path:: packages/b_parsers/src/transform/index.ts

export * from "./translate";
export * from "./rotate";
export * from "./scale";
export * from "./skew";
export * from "./matrix";
export * from "./perspective";

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseTranslateFunction } from "./translate";
import { parseRotateFunction } from "./rotate";
import { parseScaleFunction } from "./scale";
import { parseSkewFunction } from "./skew";
import { parseMatrixFunction } from "./matrix";
import { parsePerspectiveFunction } from "./perspective";

/**
 * Parse any transform function from css-tree AST
 */
export function parseTransformFunction(node: csstree.FunctionNode): ParseResult<Type.TransformFunction> {
  const funcName = node.name.toLowerCase();

  if (funcName.startsWith("translate")) {
    return parseTranslateFunction(node);
  }

  if (funcName.startsWith("rotate")) {
    return parseRotateFunction(node);
  }

  if (funcName.startsWith("scale")) {
    return parseScaleFunction(node);
  }

  if (funcName.startsWith("skew")) {
    return parseSkewFunction(node);
  }

  if (funcName.startsWith("matrix")) {
    return parseMatrixFunction(node);
  }

  if (funcName === "perspective") {
    return parsePerspectiveFunction(node);
  }

  return parseErr("transform", createError("unsupported-kind", `Unsupported transform function: ${funcName}`));
}

/**
 * Parse transform list (space-separated transform functions)
 */
export function parseTransformList(ast: csstree.Value): ParseResult<Type.TransformList> {
  const children = Array.from(ast.children);
  const functions = children.filter((n) => n.type === "Function") as csstree.FunctionNode[];

  if (functions.length === 0) {
    return parseErr("transform", createError("missing-value", "No transform functions found"));
  }

  const results: Type.TransformFunction[] = [];
  const issues: Type.Issue[] = [];

  for (const func of functions) {
    const result = parseTransformFunction(func);
    if (result.ok) {
      results.push(result.value);
    }
    issues.push(...result.issues);
  }

  return {
    ok: results.length > 0,
    value: results,
    issues,
  };
}
