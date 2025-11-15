// b_path:: packages/b_parsers/src/filter/saturate.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNumberOrPercentage } from "./number-percentage";

export function parseSaturateFunction(node: csstree.FunctionNode): ParseResult<Type.SaturateFunction> {
  const funcName = node.name.toLowerCase();
  const children = Array.from(node.children);
  const args = children.filter((n) => n.type !== "WhiteSpace");

  if (funcName !== "saturate") {
    return parseErr("filter", createError("unsupported-kind", `Expected saturate function, got ${funcName}`));
  }

  if (args.length === 0) {
    return parseOk({ kind: "saturate" });
  }

  if (args.length !== 1) {
    return parseErr("filter", createError("invalid-syntax", "saturate() requires 0 or 1 argument"));
  }

  const valueResult = parseNumberOrPercentage(args[0]);
  if (!valueResult.ok) {
    return parseErr("filter", valueResult.issues[0] ?? createError("invalid-value", "Invalid value"));
  }

  return parseOk({ kind: "saturate", value: valueResult.value });
}
