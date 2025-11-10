// b_path:: packages/b_declarations/src/utils/generate-value.ts

import { generateOk, type CssValue, type GenerateResult } from "@b/types";
import { cssValueToCss } from "@b/utils";
import { isCssValue } from "./type-guards";

/**
 * Generate CSS from a value that may be concrete or a CssValue.
 *
 * This wrapper bridges the declaration layer (which accepts T | CssValue)
 * and the concrete generator layer (which expects only T).
 *
 * Architecture:
 * - Declaration schemas validate: T | CssValue
 * - Concrete generators expect: T
 * - This function: checks and delegates appropriately
 *
 * @param value - Either a concrete value (T) or a CssValue (var, calc, etc.)
 * @param concreteGenerator - Generator function that handles concrete values
 * @returns GenerateResult with CSS string
 *
 * @example
 * ```typescript
 * // Before:
 * const result = Generators.Background.generateBackgroundSizeValue(ir.values[i]);
 * // ❌ Type error: ir.values[i] is BgSize | CssValue
 *
 * // After:
 * const result = generateValue(ir.values[i], Generators.Background.generateBackgroundSizeValue);
 * // ✅ Type-safe: wrapper handles both cases
 * ```
 */
export function generateValue<T>(
  value: T | CssValue | string,
  concreteGenerator: (value: T) => GenerateResult,
): GenerateResult {
  // Handle CssValue (var, calc, etc.)
  if (isCssValue(value)) {
    return generateOk(cssValueToCss(value));
  }
  
  // Handle string literals (e.g., "border-box", "padding-box")
  if (typeof value === "string") {
    return generateOk(value);
  }
  
  // Handle concrete IR types
  return concreteGenerator(value as T);
}
