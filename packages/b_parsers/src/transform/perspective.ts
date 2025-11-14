// b_path:: packages/b_parsers/src/transform/perspective.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseLengthNode } from "../length";

/**
 * Parse perspective function from css-tree AST
 * @see https://drafts.csswg.org/css-transforms-2/#funcdef-perspective
 */

export function parsePerspectiveFunction(node: csstree.FunctionNode): ParseResult<Type.PerspectiveFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName !== "perspective") {
    return parseErr("transform", createError("unsupported-kind", `Expected perspective function, got ${funcName}`));
  }

  if (args.length !== 1) {
    return parseErr("transform", createError("invalid-syntax", "perspective() requires 1 argument"));
  }

  const lengthResult = parseLengthNode(args[0]);
  if (!lengthResult.ok) {
    return parseErr("transform", lengthResult.issues[0] ?? createError("invalid-value", "Invalid length"));
  }

  return parseOk({
    kind: "perspective",
    length: lengthResult.value,
  });
}
