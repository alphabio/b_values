// b_path:: packages/b_declarations/src/utils/keywords.ts
import { ok, err, type Result } from "@b/types";

/**
 * CSS-wide keywords that apply to all properties.
 * https://www.w3.org/TR/css-values-4/#common-keywords
 */
export const CSS_WIDE_KEYWORDS = ["inherit", "initial", "unset", "revert", "revert-layer"] as const;

export type CSSWideKeyword = (typeof CSS_WIDE_KEYWORDS)[number];

/**
 * Check if a value is a CSS-wide keyword.
 */
export function isCSSWideKeyword(value: string): value is CSSWideKeyword {
  return CSS_WIDE_KEYWORDS.includes(value as CSSWideKeyword);
}

/**
 * Parse a CSS-wide keyword.
 */
export function parseCSSWideKeyword(value: string): Result<CSSWideKeyword, string> {
  const normalized = value.trim().toLowerCase();

  if (isCSSWideKeyword(normalized)) {
    return ok(normalized);
  }

  return err(`Not a CSS-wide keyword: ${value}`);
}
