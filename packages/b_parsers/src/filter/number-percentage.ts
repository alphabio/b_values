// b_path:: packages/b_parsers/src/filter/number-percentage.ts

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, parseOk, type ParseResult } from "@b/types";
import type * as Type from "@b/types";
import { parseNumberNode, parseLengthPercentageNode } from "../length";

/**
 * Parse number or percentage value (used by brightness, contrast, grayscale, invert, opacity, saturate, sepia)
 */
export function parseNumberOrPercentage(node: csstree.CssNode): ParseResult<number | Type.Percentage> {
  // Try number first
  if (node.type === "Number") {
    const numberResult = parseNumberNode(node);
    if (numberResult.ok) {
      return parseOk(numberResult.value);
    }
  }

  // Try percentage
  if (node.type === "Percentage") {
    const percentResult = parseLengthPercentageNode(node);
    if (percentResult.ok && percentResult.value.unit === "%") {
      return parseOk({ value: percentResult.value.value, unit: "%" });
    }
  }

  return parseErr("filter", createError("invalid-value", "Expected number or percentage"));
}
