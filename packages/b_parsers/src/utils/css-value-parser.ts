// b_path:: packages/b_parsers/src/utils/css-value-parser.ts
import type * as csstree from "@eslint/css-tree";
import { forwardParseErr, type ParseResult, type CssValue } from "@b/types";
import { parseCssValueNodeInternal } from "@b/utils";
import { parseComplexFunction } from "./function-dispatcher";

/**
 * CSS value parser with full complex function support.
 *
 * ✅ **USE THIS** for property parsing.
 *
 * This is the correct entry point for parsing CSS values in property parsers.
 * It handles all CSS functions including:
 * - Gradients: linear-gradient(), radial-gradient(), conic-gradient()
 * - Colors: rgb(), hsl(), lab(), lch(), oklch(), oklab(), color()
 * - Math: calc(), min(), max(), clamp()
 * - Plus all basic values: numbers, dimensions, percentages, keywords, var()
 *
 * Implementation:
 * - Function nodes → Try complex function dispatcher first
 * - Fallback → Basic parser from @b/utils for primitives
 *
 * @param node - CSS AST node to parse
 * @returns ParseResult with CssValue (may include complex function IRs)
 *
 * @example
 * ```typescript
 * // In property parser:
 * import { parseNodeToCssValue } from "@b/parsers";
 *
 * const result = parseNodeToCssValue(node);
 * if (result.ok && result.value.kind === "gradient") {
 *   // Gradient IR available
 * }
 * ```
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
  return parseCssValueNodeInternal(node);
}
