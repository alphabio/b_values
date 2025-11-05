// b_path:: packages/b_parsers/src/utils/color-interpolation.ts
import type * as csstree from "css-tree";
import type { ColorInterpolationMethod } from "@b/types";
import type { HueInterpolationMethod } from "@b/keywords";

/**
 * Parse color interpolation method from gradient nodes.
 *
 * Handles syntax: `in <color-space> [<hue-interpolation-method>]`
 *
 * @example
 * // "in hsl"
 * // "in hsl longer hue"
 * // "in oklch shorter hue"
 *
 * @param nodes - Array of CSS AST nodes
 * @param startIndex - Index to start parsing from (should point to "in" keyword)
 * @returns Color interpolation method and next index, or undefined if not found
 */
export function parseColorInterpolationMethod(
  nodes: csstree.CssNode[],
  startIndex: number,
): { method: ColorInterpolationMethod; nextIndex: number } | undefined {
  let idx = startIndex;
  const node = nodes[idx];

  // Must start with "in" keyword
  if (!node || node.type !== "Identifier" || node.name.toLowerCase() !== "in") {
    return undefined;
  }

  idx++;
  const spaceNode = nodes[idx];

  // Must have color space identifier
  if (!spaceNode || spaceNode.type !== "Identifier") {
    return undefined;
  }

  const space = spaceNode.name.toLowerCase();
  let method: ColorInterpolationMethod = { colorSpace: space } as ColorInterpolationMethod;
  idx++;

  // Optional: hue interpolation method (e.g., "longer hue", "shorter hue")
  const hueNode = nodes[idx];
  if (hueNode?.type === "Identifier") {
    const hueWord1 = hueNode.name.toLowerCase();

    if (hueWord1 === "longer" || hueWord1 === "shorter" || hueWord1 === "increasing" || hueWord1 === "decreasing") {
      idx++;
      const hueNode2 = nodes[idx];

      if (hueNode2?.type === "Identifier" && hueNode2.name.toLowerCase() === "hue") {
        method = {
          colorSpace: space,
          hueInterpolationMethod: `${hueWord1} hue` as HueInterpolationMethod,
        } as ColorInterpolationMethod;
        idx++;
      }
    }
  }

  return { method, nextIndex: idx };
}
