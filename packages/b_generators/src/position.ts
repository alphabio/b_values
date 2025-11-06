// b_path:: packages/b_generators/src/position.ts
import { generateOk, type GenerateResult } from "@b/types";
import type * as Type from "@b/types";
import { cssValueToCss } from "@b/utils";

/**
 * Generate CSS position string from Position2D IR
 * Supports both simple values and edge+offset syntax
 * @see https://drafts.csswg.org/css-backgrounds-3/#typedef-bg-position
 */
export function generate(position: Type.Position2D): GenerateResult {
  const horizontal = generatePositionComponent(position.horizontal);
  const vertical = generatePositionComponent(position.vertical);

  return generateOk(`${horizontal} ${vertical}`);
}

/**
 * Generate CSS for a single position component (horizontal or vertical)
 */
function generatePositionComponent(component: Type.CssValue | Type.PositionEdgeOffset): string {
  // Check if it's edge+offset structure
  if ("edge" in component) {
    const offset = cssValueToCss(component.offset);
    return `${component.edge} ${offset}`;
  }

  // Simple value
  return cssValueToCss(component);
}
