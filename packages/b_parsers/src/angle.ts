// b_path:: packages/b_parsers/src/angle.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import * as Unit from "@b/units";

/**
 * Parse angle AST node from css-tree.
 *
 * @see https://drafts.csswg.org/css-values-4/#angles
 */
export function parseAngleNode(node: csstree.CssNode): ParseResult<Type.Angle> {
  if (node.type !== "Dimension") {
    return parseErr("angle", createError("invalid-syntax", `Expected angle dimension, but got node type ${node.type}`));
  }

  const value = Number.parseFloat(node.value);
  if (Number.isNaN(value)) {
    return parseErr("angle", createError("invalid-value", "Invalid angle value: not a number"));
  }

  if (!Unit.ANGLE_UNITS.includes(node.unit as (typeof Unit.ANGLE_UNITS)[number])) {
    return parseErr("angle", createError("invalid-value", `Invalid angle unit: '${node.unit}'`));
  }

  return parseOk({ value, unit: node.unit as (typeof Unit.ANGLE_UNITS)[number] });
}
