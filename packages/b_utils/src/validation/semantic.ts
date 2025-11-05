// b_path:: packages/b_utils/src/validation/semantic.ts

import type { CssValue, Issue } from "@b/types";
import { createWarning } from "@b/types";

/**
 * Check if a literal value is in expected range.
 * Returns warning if out of range, undefined if OK or not applicable.
 *
 * Only validates literal values - returns undefined for variables, calc, etc.
 *
 * @param value - CssValue to check
 * @param min - Minimum valid value (inclusive)
 * @param max - Maximum valid value (inclusive)
 * @param context - Context for error message
 * @returns Warning issue if out of range, undefined otherwise
 *
 * @example
 * ```typescript
 * const warning = checkLiteralRange(lit(300), 0, 255, { field: "r", typeName: "RGBColor" });
 * // Returns warning: "r value 300 is out of valid range 0-255 in RGBColor"
 * ```
 *
 * @public
 */
export function checkLiteralRange(
  value: CssValue,
  min: number,
  max: number,
  context: {
    field: string;
    unit?: string;
    typeName?: string;
    parentPath?: (string | number)[];
  },
): Issue | undefined {
  // Only validate literals
  if (value.kind !== "literal") return undefined;

  const numericValue = value.value;

  if (numericValue < min || numericValue > max) {
    const unit = context.unit ?? value.unit ?? "";
    const typeInfo = context.typeName ? ` in ${context.typeName}` : "";
    return createWarning(
      "invalid-value",
      `${context.field} value ${numericValue}${unit} is out of valid range ${min}-${max}${unit}${typeInfo}`,
      {
        suggestion: `Use a value between ${min}${unit} and ${max}${unit}`,
        path: [...(context.parentPath ?? []), context.field],
      },
    );
  }

  return undefined;
}

/**
 * Check RGB component (0-255 for integers, 0-100 for percentages).
 *
 * @param value - CssValue to check
 * @param field - Field name (e.g., "r", "g", "b")
 * @param typeName - Optional type name for error messages
 * @returns Warning issue if out of range, undefined otherwise
 *
 * @example
 * ```typescript
 * checkRGBComponent(lit(-255), "r", "RGBColor");
 * // Returns warning
 *
 * checkRGBComponent(lit(50, "%"), "r", "RGBColor");
 * // Returns undefined (valid percentage)
 * ```
 *
 * @public
 */
export function checkRGBComponent(
  value: CssValue,
  field: string,
  typeName?: string,
  parentPath?: (string | number)[],
): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  // Percentage (0-100%)
  if (value.unit === "%") {
    return checkLiteralRange(value, 0, 100, { field, unit: "%", typeName, parentPath });
  }

  // Integer (0-255)
  return checkLiteralRange(value, 0, 255, { field, typeName, parentPath });
}

/**
 * Check alpha value (0-1 for numbers, 0-100% for percentages).
 *
 * @param value - CssValue to check
 * @param field - Field name (e.g., "alpha")
 * @param typeName - Optional type name for error messages
 * @returns Warning issue if out of range, undefined otherwise
 *
 * @example
 * ```typescript
 * checkAlpha(lit(1.5), "alpha", "RGBColor");
 * // Returns warning
 *
 * checkAlpha(lit(50, "%"), "alpha", "RGBColor");
 * // Returns undefined (valid percentage)
 * ```
 *
 * @public
 */
export function checkAlpha(
  value: CssValue,
  field: string,
  typeName?: string,
  parentPath?: (string | number)[],
): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  // Percentage (0-100%)
  if (value.unit === "%") {
    return checkLiteralRange(value, 0, 100, { field, unit: "%", typeName, parentPath });
  }

  // Number (0-1)
  return checkLiteralRange(value, 0, 1, { field, typeName, parentPath });
}

/**
 * Check hue value (0-360 degrees, wraps around).
 * Note: Hue can technically be any value (wraps), but warn if unreasonable.
 *
 * @param value - CssValue to check
 * @param field - Field name (e.g., "h")
 * @param typeName - Optional type name for error messages
 * @returns Warning issue if unusual, undefined otherwise
 *
 * @example
 * ```typescript
 * checkHue(lit(720), "h", "HSLColor");
 * // Returns warning (unusually large)
 *
 * checkHue(lit(180), "h", "HSLColor");
 * // Returns undefined (valid)
 * ```
 *
 * @public
 */
export function checkHue(value: CssValue, field: string, typeName?: string): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  const typeInfo = typeName ? ` in ${typeName}` : "";

  // Allow any degree unit
  if (value.unit && !["deg", "rad", "grad", "turn"].includes(value.unit)) {
    return createWarning("invalid-value", `${field} has unsupported unit '${value.unit}'${typeInfo}`, {
      suggestion: "Use deg, rad, grad, or turn units for hue",
      path: [field],
    });
  }

  // Warn if way outside 0-360 (even though it wraps)
  if (value.unit === "deg" || !value.unit) {
    if (value.value < -360 || value.value > 720) {
      return createWarning("invalid-value", `${field} value ${value.value}deg is unusually large${typeInfo}`, {
        suggestion: "Hue typically ranges from 0-360 degrees",
        path: [field],
      });
    }
  }

  return undefined;
}

/**
 * Check percentage (0-100%).
 *
 * @param value - CssValue to check
 * @param field - Field name (e.g., "s", "l")
 * @param typeName - Optional type name for error messages
 * @returns Warning issue if out of range, undefined otherwise
 *
 * @example
 * ```typescript
 * checkPercentage(lit(150, "%"), "s", "HSLColor");
 * // Returns warning
 *
 * checkPercentage(lit(50, "%"), "s", "HSLColor");
 * // Returns undefined (valid)
 * ```
 *
 * @public
 */
export function checkPercentage(value: CssValue, field: string, typeName?: string): Issue | undefined {
  if (value.kind !== "literal") return undefined;

  return checkLiteralRange(value, 0, 100, { field, unit: "%", typeName });
}

/**
 * Collect all warnings from validators.
 * Filters out undefined values.
 *
 * @param validators - Array of validation results
 * @returns Array of Issues (warnings only)
 *
 * @example
 * ```typescript
 * const warnings = collectWarnings(
 *   checkRGBComponent(r, "r"),
 *   checkRGBComponent(g, "g"),
 *   checkRGBComponent(b, "b"),
 * );
 * ```
 *
 * @public
 */
export function collectWarnings(...validators: (Issue | undefined)[]): Issue[] {
  return validators.filter((issue): issue is Issue => issue !== undefined);
}
