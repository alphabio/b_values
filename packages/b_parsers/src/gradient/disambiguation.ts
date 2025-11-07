// b_path:: packages/b_parsers/src/gradient/disambiguation.ts
import type * as csstree from "@eslint/css-tree";
import * as Utils from "../utils";

/**
 * Result of first argument disambiguation
 */
export type DisambiguationResult = "direction" | "color";

/**
 * List of CSS color function names
 */
const COLOR_FUNCTIONS = ["rgb", "rgba", "hsl", "hsla", "hwb", "lab", "lch", "oklab", "oklch", "color"] as const;

/**
 * Check if a function name is a color function
 */
function isColorFunction(funcName: string): boolean {
  return COLOR_FUNCTIONS.includes(funcName.toLowerCase() as (typeof COLOR_FUNCTIONS)[number]);
}

/**
 * Disambiguate whether the first argument in a gradient should be parsed
 * as a direction/position or as the first color stop.
 *
 * This handles the ambiguity where CSS value functions like var() and calc()
 * could represent either a direction/angle OR a color value depending on context.
 *
 * **Strategy:**
 * - Unambiguous cases: Explicit types (Dimension, Hash, color functions) → determined directly
 * - Ambiguous cases (var/calc/clamp/min/max): Use lookahead to count remaining stops
 *   - If >= 2 stops remain after consuming as direction → parse as direction
 *   - Otherwise → parse as color stop
 *
 * @param children - Array of AST nodes from the gradient function
 * @returns "direction" if should parse as direction, "color" if should parse as color stop
 *
 * @example
 * ```typescript
 * // Unambiguous: angle
 * disambiguateFirstArg([Dimension(45deg), ...]) // "direction"
 *
 * // Unambiguous: color
 * disambiguateFirstArg([Hash(#ff0000), ...]) // "color"
 * disambiguateFirstArg([Function(rgb), ...]) // "color"
 *
 * // Ambiguous: var with 2+ colors
 * disambiguateFirstArg([Function(var), Identifier(red), Identifier(blue)]) // "direction"
 *
 * // Ambiguous: var with 1 color
 * disambiguateFirstArg([Function(var), Identifier(blue)]) // "color"
 * ```
 */
export function disambiguateFirstArg(children: csstree.CssNode[]): DisambiguationResult {
  if (children.length === 0) {
    return "color"; // Default to color for empty
  }

  const firstNode = children[0];
  if (!firstNode) {
    return "color";
  }

  // Skip leading whitespace
  let idx = 0;
  while (children[idx] && children[idx]?.type === "WhiteSpace") {
    idx++;
  }
  const first = children[idx];
  if (!first) {
    return "color";
  }

  // ========================================
  // UNAMBIGUOUS: Direction
  // ========================================

  // Explicit angle with unit (45deg, 0.5turn, 100grad, 1.5rad)
  if (first.type === "Dimension") {
    return "direction";
  }

  // Unitless number (treated as degrees: 0, 45, 90, etc)
  if (first.type === "Number") {
    return "direction";
  }

  // Keyword direction (to top, to right, to bottom left, etc)
  if (first.type === "Identifier" && first.name.toLowerCase() === "to") {
    return "direction";
  }

  // ========================================
  // UNAMBIGUOUS: Color
  // ========================================

  // Hex color (#ff0000, #f00)
  if (first.type === "Hash") {
    return "color";
  }

  // Named color identifier (red, blue, transparent)
  // Excludes 'to' which is handled above
  if (first.type === "Identifier") {
    return "color";
  }

  // ========================================
  // POTENTIALLY AMBIGUOUS: Functions
  // ========================================

  if (first.type === "Function") {
    const funcName = first.name.toLowerCase();

    // Color functions are unambiguous
    if (isColorFunction(funcName)) {
      return "color";
    }

    // CSS value functions (var, calc, clamp, min, max) are ambiguous
    // They could be:
    // - var(--angle) → direction
    // - var(--color) → color
    // - calc(45deg + 10deg) → direction
    // - calc(rgb(255,0,0) + rgb(0,0,255)) → color (hypothetically)

    // Strategy: Count remaining comma-separated groups after this node
    // If >= 2 groups remain, then this can be direction with valid gradient
    // If < 2 groups remain, must be color (gradient needs >= 2 color stops)

    const remainingGroups = Utils.Ast.splitNodesByComma(children, {
      startIndex: idx + 1,
      trimWhitespace: true,
    });

    if (remainingGroups.length >= 2) {
      // Valid: first arg as direction + 2+ color stops
      return "direction";
    }

    // Not enough stops if we consume this as direction
    // Must be a color stop
    return "color";
  }

  // ========================================
  // DEFAULT: Color
  // ========================================

  // For any other node type, default to color stop
  return "color";
}
