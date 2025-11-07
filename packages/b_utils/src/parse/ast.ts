// b_path:: packages/b_utils/src/parse/ast.ts
/**
 * AST utility functions for working with css-tree nodes
 * Part of the AST-native architecture refactoring
 */

import type * as csstree from "@eslint/css-tree";

/**
 * Split AST nodes by comma operators
 *
 * Replaces string-based splitByComma with AST-native approach.
 * Handles nested functions naturally via AST structure.
 *
 * @example
 * ```ts
 * // Input: [red, Function(calc), Operator(,), blue]
 * // Output: [[red, Function(calc)], [blue]]
 * const groups = splitNodesByComma(nodes);
 * ```
 */
export function splitNodesByComma(nodes: csstree.CssNode[]): csstree.CssNode[][] {
  const groups: csstree.CssNode[][] = [];
  let current: csstree.CssNode[] = [];

  for (const node of nodes) {
    if (node.type === "Operator" && node.value === ",") {
      if (current.length > 0) {
        groups.push(current);
        current = [];
      }
    } else {
      current.push(node);
    }
  }

  if (current.length > 0) {
    groups.push(current);
  }

  return groups;
}

/**
 * Check if node is a specific function
 *
 * Type guard for FunctionNode with optional name matching.
 *
 * @example
 * ```ts
 * if (isFunctionNode(node, "calc")) {
 *   // node is FunctionNode with name "calc"
 * }
 * ```
 */
export function isFunctionNode(node: csstree.CssNode, name?: string): node is csstree.FunctionNode {
  if (node.type !== "Function") return false;
  if (name) return node.name.toLowerCase() === name.toLowerCase();
  return true;
}

/**
 * Check if node is an identifier with optional value matching
 */
export function isIdentifier(node: csstree.CssNode, value?: string): node is csstree.Identifier {
  if (node.type !== "Identifier") return false;
  if (value) return node.name.toLowerCase() === value.toLowerCase();
  return true;
}

/**
 * Check if node is a dimension (number with unit)
 */
export function isDimension(node: csstree.CssNode): node is csstree.Dimension {
  return node.type === "Dimension";
}

/**
 * Check if node is a percentage
 */
export function isPercentage(node: csstree.CssNode): node is csstree.Percentage {
  return node.type === "Percentage";
}

/**
 * Check if node is a number
 */
export function isNumber(node: csstree.CssNode): boolean {
  return node.type === "Number";
}

/**
 * Convert AST node list to array
 *
 * css-tree uses linked lists, this converts to standard arrays.
 */
export function nodeListToArray(list: csstree.List<csstree.CssNode>): csstree.CssNode[] {
  return list.toArray();
}

/**
 * Extract location from a node, returning undefined if not available
 */
export function getNodeLocation(node: csstree.CssNode): csstree.CssLocationRange | undefined {
  return node.loc ?? undefined;
}

/**
 * Convert css-tree location to our SourceLocation format
 *
 * css-tree provides line/column ranges, we need offset/length.
 * This is a best-effort conversion - if source is available we calculate offset,
 * otherwise we return undefined (location tracking disabled).
 *
 * @param loc - css-tree location range
 * @param source - original source string (needed to calculate offsets)
 * @returns SourceLocation with offset/length, or undefined if not calculable
 */
export function convertLocation(
  loc: csstree.CssLocationRange | undefined,
  source?: string,
): { offset: number; length: number } | undefined {
  if (!loc || !source) return undefined;

  // Calculate offset from line/column
  const lines = source.split("\n");
  let offset = 0;

  // Add all complete lines before start line
  for (let i = 0; i < loc.start.line - 1; i++) {
    offset += lines[i].length + 1; // +1 for newline
  }

  // Add column offset on start line
  offset += loc.start.column - 1;

  // Calculate length
  let length = 0;
  if (loc.start.line === loc.end.line) {
    // Same line: just column difference
    length = loc.end.column - loc.start.column;
  } else {
    // Multiple lines: calculate total
    length = lines[loc.start.line - 1].length - (loc.start.column - 1);
    for (let i = loc.start.line; i < loc.end.line - 1; i++) {
      length += lines[i].length + 1;
    }
    length += loc.end.column;
  }

  return { offset, length };
}
