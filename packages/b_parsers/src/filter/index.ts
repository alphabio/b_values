// b_path:: packages/b_parsers/src/filter/index.ts

export * from "./blur";
export * from "./brightness";
export * from "./contrast";
export * from "./grayscale";
export * from "./hue-rotate";
export * from "./invert";
export * from "./opacity";
export * from "./saturate";
export * from "./sepia";
export * from "./drop-shadow";

import type * as csstree from "@eslint/css-tree";
import { createError, parseErr, type ParseResult, type Issue } from "@b/types";
import type * as Type from "@b/types";
import { parseBlurFunction } from "./blur";
import { parseBrightnessFunction } from "./brightness";
import { parseContrastFunction } from "./contrast";
import { parseGrayscaleFunction } from "./grayscale";
import { parseHueRotateFunction } from "./hue-rotate";
import { parseInvertFunction } from "./invert";
import { parseOpacityFunction } from "./opacity";
import { parseSaturateFunction } from "./saturate";
import { parseSepiaFunction } from "./sepia";
import { parseDropShadowFunction } from "./drop-shadow";

/**
 * Parse a single filter function from css-tree AST
 */
export function parseFilterFunction(node: csstree.FunctionNode): ParseResult<Type.FilterFunction> {
  const funcName = node.name.toLowerCase();

  switch (funcName) {
    case "blur":
      return parseBlurFunction(node);
    case "brightness":
      return parseBrightnessFunction(node);
    case "contrast":
      return parseContrastFunction(node);
    case "grayscale":
      return parseGrayscaleFunction(node);
    case "hue-rotate":
      return parseHueRotateFunction(node);
    case "invert":
      return parseInvertFunction(node);
    case "opacity":
      return parseOpacityFunction(node);
    case "saturate":
      return parseSaturateFunction(node);
    case "sepia":
      return parseSepiaFunction(node);
    case "drop-shadow":
      return parseDropShadowFunction(node);
    default:
      return parseErr("filter", createError("unsupported-kind", `Unknown filter function: ${funcName}`));
  }
}

/**
 * Parse filter list from css-tree AST
 */
export function parseFilterList(ast: csstree.Value): ParseResult<Type.FilterList> {
  const children = Array.from(ast.children);
  const nodes = children.filter((n) => n.type !== "WhiteSpace");

  const filters: Type.FilterFunction[] = [];
  const issues: Issue[] = [];

  for (const node of nodes) {
    if (node.type === "Function") {
      const result = parseFilterFunction(node);
      if (result.ok) {
        filters.push(result.value);
        issues.push(...result.issues);
      } else {
        return parseErr("filter", result.issues[0] ?? createError("invalid-value", "Failed to parse filter function"));
      }
    } else if (node.type === "Url") {
      // SVG filter references - Phase 1: block with clear error
      return parseErr("filter", createError("unsupported-kind", "url() filter references not yet supported"));
    } else {
      return parseErr("filter", createError("invalid-syntax", `Unexpected node type in filter list: ${node.type}`));
    }
  }

  if (filters.length === 0) {
    return parseErr("filter", createError("missing-value", "Empty filter list"));
  }

  return { ok: true, property: "filter", value: filters, issues };
}
