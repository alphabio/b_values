// b_path:: packages/b_keywords/src/universal-functions.ts

/**
 * Universal CSS functions that apply to all properties.
 *
 * These functions can appear in any CSS value context and should be
 * handled at the declaration/wrapper level, not by individual property parsers.
 *
 * SINGLE SOURCE OF TRUTH - do not duplicate this list elsewhere.
 *
 * @see https://drafts.csswg.org/css-values-4/#functional-notation
 */
export const UNIVERSAL_CSS_FUNCTIONS = [
  "var", // CSS Variables
  "calc", // Math
  "min", // Math
  "max", // Math
  "clamp", // Math
  "attr", // Attribute references
  "env", // Environment variables
] as const;

/**
 * Type representing any universal CSS function name.
 */
export type UniversalCssFunction = (typeof UNIVERSAL_CSS_FUNCTIONS)[number];
