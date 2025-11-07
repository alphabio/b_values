// b_path:: packages/b_parsers/src/gradient/shared-parsing.ts
import type * as csstree from "@eslint/css-tree";
import { createWarning, parseOk, type ParseResult, forwardParseErr } from "@b/types";
import type * as Type from "@b/types";
import * as Utils from "../utils";

/**
 * Parse color interpolation method from "in" keyword.
 *
 * Looks for "in <color-space> [<hue-method>]" pattern.
 *
 * @returns Result with method and next index, or forwards parse error
 */
export function parseColorInterpolationMethod(
  children: csstree.CssNode[],
  idx: number,
): ParseResult<{ method: Type.ColorInterpolationMethod | undefined; nextIdx: number }> {
  const inNode = children[idx];
  if (inNode?.type === "Identifier" && inNode.name.toLowerCase() === "in") {
    const interpolationResult = Utils.parseColorInterpolationMethod(children, idx);
    if (!interpolationResult) {
      return parseOk({ method: undefined, nextIdx: idx });
    }
    return parseOk({
      method: interpolationResult.method,
      nextIdx: interpolationResult.nextIndex,
    });
  }

  return parseOk({ method: undefined, nextIdx: idx });
}

/**
 * Parse CSS string to gradient function node.
 *
 * Validates CSS syntax and finds the gradient function.
 *
 * @param css - CSS gradient string
 * @param gradientNames - Function names to look for (e.g., ["linear-gradient", "repeating-linear-gradient"])
 * @returns Result with function node
 */
export function parseCssToGradientFunction(css: string, gradientNames: string[]): ParseResult<csstree.FunctionNode> {
  const astResult = Utils.Ast.parseCssString(css, "value");
  if (!astResult.ok) {
    return forwardParseErr<csstree.FunctionNode>(astResult);
  }

  const funcResult = Utils.Ast.findFunctionNode(astResult.value, gradientNames);
  if (!funcResult.ok) {
    return forwardParseErr<csstree.FunctionNode>(funcResult);
  }

  return parseOk(funcResult.value);
}

/**
 * Validate parentheses are balanced in CSS string.
 *
 * Returns a warning issue if unbalanced, undefined if balanced.
 *
 * @param css - CSS gradient string
 * @param gradientType - Type name for warning message
 * @returns Warning issue or undefined
 */
export function validateParentheses(css: string, gradientType: string): Type.Issue | undefined {
  const openCount = (css.match(/\(/g) || []).length;
  const closeCount = (css.match(/\)/g) || []).length;

  if (openCount !== closeCount) {
    return createWarning("invalid-syntax", `Unbalanced parentheses in ${gradientType}-gradient`, {
      property: "gradient",
      suggestion: "Check that all parentheses are properly closed",
    });
  }

  return undefined;
}
