// b_path:: packages/b_parsers/src/utils/css-value-parser.ts
import type * as csstree from "@eslint/css-tree";
import { forwardParseErr, type ParseResult, type CssValue } from "@b/types";
import { parseCssValueNode } from "@b/utils";
import { parseComplexFunction } from "./function-dispatcher";

/**
 * CSS value parser that delegates complex functions to specialized parsers.
 *
 * This wrapper combines the basic parseCssValueNode from @b/utils with the
 * complex function dispatcher from @b/parsers.
 *
 * Use this function instead of parseCssValueNode when you want calc(), min(), max(),
 * clamp(), rgb(), hsl(), etc. to be parsed into their semantic IR structures.
 *
 * @param node - CSS AST node to parse
 * @returns ParseResult with CssValue (may include complex function IRs)
 */
export function parseNodeToCssValue(node: csstree.CssNode): ParseResult<CssValue> {
  // For function nodes, try the complex function dispatcher first
  if (node.type === "Function") {
    const complexResult = parseComplexFunction(node);
    if (complexResult) {
      if (complexResult.ok) {
        return complexResult;
      }
      // The complex parser encountered an error while parsing
      return forwardParseErr<CssValue>(complexResult);
    }
  }

  // Fall back to basic parser for primitives and unknown functions
  return parseCssValueNode(node);
}
