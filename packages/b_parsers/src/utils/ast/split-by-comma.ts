// b_path:: packages/b_parsers/src/utils/ast/split-by-comma.ts
import type * as csstree from "@eslint/css-tree";

export interface SplitByCommaOptions {
  /** Start index in nodes array (default: 0) */
  startIndex?: number;
  /** Allow empty groups between commas (default: false) */
  allowEmpty?: boolean;
  /** Skip whitespace nodes (default: true) */
  trimWhitespace?: boolean;
}

/**
 * Split array of AST nodes by comma operators.
 *
 * Used for parsing comma-separated function arguments.
 * Returns array of node groups, where each group is the nodes between commas.
 *
 * **Important:** Only splits on top-level commas, ignoring commas inside nested functions.
 *
 * @param nodes - Array of AST nodes to split
 * @param options - Parsing options
 * @returns Array of node groups (each group is nodes between commas)
 *
 * @example
 * ```typescript
 * // For linear-gradient(45deg, red, blue 50%, green)
 * // After parsing direction, start from index 2
 * const groups = splitNodesByComma(children, { startIndex: 2 });
 * // Returns: [[red], [blue, 50%], [green]]
 * ```
 */
export function splitNodesByComma(nodes: csstree.CssNode[], options: SplitByCommaOptions = {}): csstree.CssNode[][] {
  const { startIndex = 0, allowEmpty = false, trimWhitespace = true } = options;

  const groups: csstree.CssNode[][] = [];
  let currentGroup: csstree.CssNode[] = [];

  for (let i = startIndex; i < nodes.length; i++) {
    const node = nodes[i];
    if (!node) continue;

    if (trimWhitespace && node.type === "WhiteSpace") {
      continue;
    }

    // Track nesting depth - enter function
    if (node.type === "Function") {
      currentGroup.push(node);
      // Functions contain their own children, no need to track depth here
      // The function node itself contains all nested content
      continue;
    }

    // Only split on top-level commas (when not inside a function)
    if (node.type === "Operator" && "value" in node && node.value === ",") {
      if (currentGroup.length > 0 || allowEmpty) {
        groups.push(currentGroup);
        currentGroup = [];
      }
    } else {
      currentGroup.push(node);
    }
  }

  if (currentGroup.length > 0 || allowEmpty) {
    groups.push(currentGroup);
  }

  return groups;
}

/**
 * Check if a comma exists at the given index.
 *
 * @param nodes - Array of AST nodes
 * @param index - Index to check
 * @returns True if node at index is a comma operator
 */
export function isCommaAt(nodes: csstree.CssNode[], index: number): boolean {
  const node = nodes[index];
  return Boolean(node && node.type === "Operator" && "value" in node && node.value === ",");
}

/**
 * Skip comma at index if present, return next index.
 *
 * @param nodes - Array of AST nodes
 * @param index - Current index
 * @returns Index after comma if present, otherwise same index
 *
 * @example
 * ```typescript
 * let idx = 5;
 * idx = skipComma(children, idx); // Skips comma if at index 5
 * ```
 */
export function skipComma(nodes: csstree.CssNode[], index: number): number {
  return isCommaAt(nodes, index) ? index + 1 : index;
}
