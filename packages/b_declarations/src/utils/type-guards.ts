// b_path:: packages/b_declarations/src/utils/type-guards.ts

import type { CssValue } from "@b/types";
import { UNIVERSAL_CSS_FUNCTIONS } from "@b/keywords";
import type * as csstree from "@eslint/css-tree";

/**
 * Exhaustive list of CssValue kinds.
 * Used to distinguish CssValue from property-specific IR structures.
 *
 * CRITICAL: Both CssValue and property IR may have a "kind" field.
 * This whitelist prevents false positives when checking generators.
 */
const CSS_VALUE_KINDS: ReadonlyArray<CssValue["kind"]> = [
  "literal",
  "keyword",
  "variable",
  "list",
  "calc",
  "calc-operation",
  "min",
  "max",
  "clamp",
  "url",
  "attr",
  "function",
  "string",
  "hex-color",
] as const;

/**
 * Type guard to check if a value is a CssValue (not a property-specific IR).
 *
 * This is critical for generators to distinguish between:
 * - CssValue: { kind: "calc", value: ... }
 * - Property IR: { kind: "explicit", horizontal: ..., vertical: ... }
 *
 * Both may have a "kind" field, so we use a whitelist of CssValue kinds.
 *
 * @param value - Value to check
 * @returns true if value is a CssValue
 *
 * @example
 * ```typescript
 * if (isCssValue(value)) {
 *   // It's var(), calc(), etc.
 *   return cssValueToCss(value);
 * } else {
 *   // It's property-specific IR
 *   return generateConcrete(value);
 * }
 * ```
 */
export function isCssValue(value: unknown): value is CssValue {
  if (typeof value !== "object" || value === null) return false;
  if (!("kind" in value)) return false;

  const kind = (value as { kind: string }).kind;
  return CSS_VALUE_KINDS.includes(kind as CssValue["kind"]);
}

/**
 * Check if a CSS AST node is a universal function.
 *
 * Universal functions (var, calc, etc.) apply to ALL properties and
 * should be handled by wrappers, not individual property parsers.
 *
 * @param node - CSS AST node
 * @returns true if the node is a universal function (var, calc, etc.)
 *
 * @example
 * ```typescript
 * if (isUniversalFunction(node)) {
 *   return parseNodeToCssValue(node);
 * }
 * // Not universal - delegate to property parser
 * ```
 */
export function isUniversalFunction(node: csstree.CssNode): boolean {
  if (node.type !== "Function") return false;
  const funcName = (node as csstree.FunctionNode).name.toLowerCase();
  return (UNIVERSAL_CSS_FUNCTIONS as readonly string[]).includes(funcName);
}

/**
 * Check if a value is a concrete property value (not a CssValue).
 * Useful for downstream consumers who need to narrow types.
 *
 * @param value - Value to check
 * @returns true if value is concrete (not CssValue)
 *
 * @example
 * ```typescript
 * if (isConcreteValue(value)) {
 *   // TypeScript knows value is T, not CssValue
 *   console.log(value.specificField);
 * }
 * ```
 */
export function isConcreteValue<T>(value: T | CssValue): value is T {
  return !isCssValue(value);
}
