// b_path:: packages/b_parsers/src/utils/css-value-functions.ts
import type * as csstree from "@eslint/css-tree";

/**
 * Check if a Function node is a CSS value function (var, calc, clamp, min, max)
 * and not a color function (rgb, hsl, hwb, lab, lch, oklch, oklab, etc.)
 *
 * This is useful for distinguishing between:
 * - CSS value functions that can appear in size/position contexts
 * - Color functions that should be treated as color stops
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
  return ["var", "calc", "clamp", "min", "max"].includes(funcName);
}
