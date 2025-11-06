// b_path:: packages/b_parsers/src/function-dispatcher.ts
import type * as csstree from "css-tree";
import type { ParseResult, CssValue } from "@b/types";
import * as Color from "./color";
import * as MathFunctions from "./math";

/**
 * Central function dispatcher for complex CSS functions.
 *
 * Maps function names to their specialized parsers.
 * This prevents duplication and ensures consistent routing.
 *
 * NOTE: var() and generic functions are NOT handled here - they're
 * handled inline in parseCssValueNode due to their generic nature.
 */

type FunctionParser = (node: csstree.FunctionNode) => ParseResult<CssValue>;

const PARSER_MAP: Record<string, FunctionParser> = {
  // Math functions
  calc: MathFunctions.parseCalcFunction as FunctionParser,
  min: MathFunctions.parseMinmaxFunction as FunctionParser,
  max: MathFunctions.parseMinmaxFunction as FunctionParser,
  clamp: MathFunctions.parseClampFunction as FunctionParser,

  // Color space functions
  rgb: Color.parseRgbFunction as FunctionParser,
  rgba: Color.parseRgbFunction as FunctionParser,
  hsl: Color.parseHslFunction as FunctionParser,
  hsla: Color.parseHslFunction as FunctionParser,
  hwb: Color.parseHwbFunction as FunctionParser,
  lab: Color.parseLabFunction as FunctionParser,
  lch: Color.parseLchFunction as FunctionParser,
  oklab: Color.parseOklabFunction as FunctionParser,
  oklch: Color.parseOklchFunction as FunctionParser,
};

/**
 * Delegates parsing of a Function AST node to the appropriate specialized parser.
 *
 * Returns null if the function is not recognized (caller should handle as generic function).
 *
 * @param node - CSS Function node
 * @returns ParseResult for known functions, null for unknown functions
 */
export function parseComplexFunction(node: csstree.FunctionNode): ParseResult<CssValue> | null {
  const funcName = node.name.toLowerCase();
  const parser = PARSER_MAP[funcName];

  if (parser) {
    return parser(node);
  }

  return null; // Not a recognized complex function
}
