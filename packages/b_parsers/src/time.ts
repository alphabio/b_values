// b_path:: packages/b_parsers/src/time.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import * as Unit from "@b/units";

/**
 * Parse time AST node from css-tree.
 *
 * @see https://drafts.csswg.org/css-values-4/#time
 */
export function parseTimeNode(node: csstree.CssNode): ParseResult<Type.Time> {
  if (node.type !== "Dimension") {
    return parseErr("time", createError("invalid-syntax", `Expected time dimension, but got node type ${node.type}`));
  }

  const value = Number.parseFloat(node.value);
  if (Number.isNaN(value)) {
    return parseErr("time", createError("invalid-value", "Invalid time value: not a number"));
  }

  if (!Unit.TIME_UNITS.includes(node.unit as (typeof Unit.TIME_UNITS)[number])) {
    return parseErr("time", createError("invalid-value", `Invalid time unit: '${node.unit}'`));
  }

  return parseOk({ value, unit: node.unit as (typeof Unit.TIME_UNITS)[number] });
}
