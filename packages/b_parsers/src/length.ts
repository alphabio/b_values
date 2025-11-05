// b_path:: packages/b_parsers/src/length.ts
import type * as csstree from "css-tree";
import { err, ok, type Result } from "@b/types";
import type * as Type from "@b/types";
import * as Unit from "@b/units";

/**
 * @see https://drafts.csswg.org/css-values-4/#lengths
 */
export function parseLengthNode(node: csstree.CssNode): Result<Type.Length, string> {
  if (node.type === "Dimension") {
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return err("Invalid length value");
    }

    const allLengthUnits = [...Unit.ABSOLUTE_LENGTH_UNITS, ...Unit.FONT_LENGTH_UNITS, ...Unit.VIEWPORT_LENGTH_UNITS];

    if (!allLengthUnits.includes(node.unit as (typeof allLengthUnits)[number])) {
      return err(`Invalid length unit: ${node.unit}`);
    }

    return ok({
      value,
      unit: node.unit as (typeof allLengthUnits)[number],
    });
  }
  return err("Expected length dimension");
}

/**
 * @see https://drafts.csswg.org/css-values-4/#percentage-value
 */
export function parseLengthPercentageNode(node: csstree.CssNode): Result<Type.LengthPercentage, string> {
  if (node.type === "Number") {
    const val = Number.parseFloat(node.value);
    if (val !== 0) {
      return err("Unitless values must be zero");
    }
    return ok({ value: 0, unit: "px" });
  }

  if (node.type === "Dimension") {
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return err("Invalid length value");
    }

    const allLengthUnits = [...Unit.ABSOLUTE_LENGTH_UNITS, ...Unit.FONT_LENGTH_UNITS, ...Unit.VIEWPORT_LENGTH_UNITS];

    if (!allLengthUnits.includes(node.unit as (typeof allLengthUnits)[number])) {
      return err(`Invalid length unit: ${node.unit}`);
    }

    return ok({
      value,
      unit: node.unit as (typeof allLengthUnits)[number],
    });
  }

  if (node.type === "Percentage") {
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return err("Invalid percentage value");
    }
    return ok({ value, unit: Unit.PERCENTAGE_UNIT });
  }

  return err("Expected length or percentage");
}

/**
 * @see https://drafts.csswg.org/css-values-4/#numbers
 */
export function parseNumberNode(node: csstree.CssNode): Result<number, string> {
  if (node.type === "Number") {
    const value = Number.parseFloat(node.value);
    if (Number.isNaN(value)) {
      return err("Invalid number value");
    }
    return ok(value);
  }
  return err("Expected number");
}
