// b_path:: packages/b_parsers/src/filter/opacity.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNumberOrPercentage } from "./number-percentage";

export function parseOpacityFunction(node: csstree.FunctionNode): ParseResult<Type.OpacityFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName !== "opacity") {
    return parseErr("filter", createError("unsupported-kind", `Expected opacity function, got ${funcName}`));
  }

  if (args.length === 0) {
    return parseOk({ kind: "opacity" });
  }

  if (args.length !== 1) {
    return parseErr("filter", createError("invalid-syntax", "opacity() requires 0 or 1 argument"));
  }

  const valueResult = parseNumberOrPercentage(args[0]);
  if (!valueResult.ok) {
    return parseErr("filter", valueResult.issues[0] ?? createError("invalid-value", "Invalid value"));
  }

  return parseOk({ kind: "opacity", value: valueResult.value });
}
