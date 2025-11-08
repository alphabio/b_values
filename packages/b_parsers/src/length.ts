// b_path:: packages/b_parsers/src/length.ts
import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import * as Unit from "@b/units";

/**
 * Parse length AST node from css-tree.
 *
 * @see https://drafts.csswg.org/css-values-4/#lengths
 */
export function parseLengthNode(node: csstree.CssNode): ParseResult<Type.Length> {
  if (node.type !== "Dimension") {
    return parseErr(
      "length",
      createError("invalid-syntax", `Expected length dimension, but got node type ${node.type}`),
    );
  }

  const value = Number.parseFloat(node.value);
  if (Number.isNaN(value)) {
    return parseErr("length", createError("invalid-value", "Invalid length value: not a number"));
  }

  const allLengthUnits = [...Unit.ABSOLUTE_LENGTH_UNITS, ...Unit.FONT_LENGTH_UNITS, ...Unit.VIEWPORT_LENGTH_UNITS];

  if (!allLengthUnits.includes(node.unit as (typeof allLengthUnits)[number])) {
    return parseErr("length", createError("invalid-value", `Invalid length unit: '${node.unit}'`));
  }

  return parseOk({
    value,
    unit: node.unit as (typeof allLengthUnits)[number],
  });
}

/**
 * Parse length or percentage AST node from css-tree.
 *
 * @see https://drafts.csswg.org/css-values-4/#percentage-value
 */
export function parseLengthPercentageNode(node: csstree.CssNode): ParseResult<Type.LengthPercentage> {
  if (node.type === "Number") {
    const val = Number.parseFloat(node.value);
    if (val !== 0) {
      return parseErr("length", createError("invalid-value", "Unitless values must be zero"));
    }
    return parseOk({ value: 0, unit: "px" });
  }

  if (node.type === "Dimension") {
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return parseErr("length", createError("invalid-value", "Invalid length value: not a number"));
    }

    const allLengthUnits = [...Unit.ABSOLUTE_LENGTH_UNITS, ...Unit.FONT_LENGTH_UNITS, ...Unit.VIEWPORT_LENGTH_UNITS];

    if (!allLengthUnits.includes(node.unit as (typeof allLengthUnits)[number])) {
      return parseErr("length", createError("invalid-value", `Invalid length unit: '${node.unit}'`));
    }

    return parseOk({
      value,
      unit: node.unit as (typeof allLengthUnits)[number],
    });
  }

  if (node.type === "Percentage") {
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return parseErr("length", createError("invalid-value", "Invalid percentage value: not a number"));
    }
    return parseOk({ value, unit: Unit.PERCENTAGE_UNIT });
  }

  return parseErr(
    "length",
    createError("invalid-syntax", `Expected length or percentage, but got node type ${node.type}`),
  );
}

/**
 * Parse number AST node from css-tree.
 *
 * @see https://drafts.csswg.org/css-values-4/#numbers
 */
export function parseNumberNode(node: csstree.CssNode): ParseResult<number> {
  if (node.type !== "Number") {
    return parseErr("length", createError("invalid-syntax", `Expected number, but got node type ${node.type}`));
  }

  const value = Number.parseFloat(node.value);
  if (Number.isNaN(value)) {
    return parseErr("length", createError("invalid-value", "Invalid number value: not a number"));
  }

  return parseOk(value);
}
