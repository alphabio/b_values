// b_path:: packages/b_parsers/src/utils/css-value-functions.ts
import type * as csstree from "@eslint/css-tree";
import { UNIVERSAL_CSS_FUNCTIONS } from "@b/keywords";

/**
 * Check if a Function node is a universal CSS function (var, calc, etc.)
 * and not a color function (rgb, hsl, hwb, lab, lch, oklch, oklab, etc.)
 *
 * This is useful for distinguishing between:
 * - Universal CSS functions that can appear in any value context
 * - Color functions that should be treated as color stops in gradients
 *
 * @example
 * isCssValueFunction(varNode) // true - var(--value)
 * isCssValueFunction(calcNode) // true - calc(50% + 10px)
 * isCssValueFunction(rgbNode) // false - rgb(255, 0, 0)
 * isCssValueFunction(hslNode) // false - hsl(0, 100%, 50%)
 */
export function isCssValueFunction(node: csstree.CssNode): boolean {
  if (node.type !== "Function") return false;
  const funcName = node.name.toLowerCase();
  return (UNIVERSAL_CSS_FUNCTIONS as readonly string[]).includes(funcName);
}
