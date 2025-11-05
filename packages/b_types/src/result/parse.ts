// b_path:: packages/b_types/src/result/parse.ts
/**
 * ParseResult type for CSS → IR parsing operations.
 *
 * @module
 */

import type { Issue } from "./issue";

/**
 * Result of parsing CSS to intermediate representation.
 *
 * Represents one of three states:
 * 1. **Success**: `ok: true`, `value` contains parsed data (type T)
 * 2. **Total failure**: `ok: false`, `value` is `undefined`, parsing failed early (fail-fast)
 * 3. **Partial success**: `ok: false`, `value` contains partial data (type T), some items parsed (multi-error)
 *
 * When `ok: false`:
 * - `issues` contains at least one error
 * - `value` is `undefined` for fail-fast parsers (e.g., single value parsing)
 * - `value` contains partial result for multi-error parsers (e.g., list parsing where some items succeeded)
 *
 * Issues array allows warnings even on success. Parsers can succeed with warnings.
 *
 * @example Fail-fast parser (single angle)
 * ```typescript
 * const result = parseAngle("invalid");
 * // { ok: false, value: undefined, issues: [error] }
 * ```
 *
 * @example Multi-error parser (background-image layers)
 * ```typescript
 * const result = parseBackgroundImage("url(a.png), invalid, url(b.png)");
 * // { ok: false, value: { kind: 'layers', layers: [valid1, valid3] }, issues: [error] }
 * // Two layers parsed successfully, one failed
 * ```
 *
 * @example Success with warnings
 * ```typescript
 * const result = parseColor("rgb(300 100 50)");
 * // { ok: true, value: rgbIR, issues: [warning] }
 * // Valid RGB syntax, but value out of range (warning)
 * ```
 *
 * @public
 */
export type ParseResult<T = unknown> =
  | { ok: true; value: T; property?: string; issues: Issue[] }
  | { ok: false; value?: undefined; property?: string; issues: Issue[] }
  | { ok: false; value: T; property?: string; issues: Issue[] };

/**
 * Create a successful ParseResult.
 *
 * @example
 * ```typescript
 * return parseOk(colorIR);
 * return parseOk(colorIR, "background-color");  // with property
 * ```
 *
 * @public
 */
export function parseOk<T>(value: T, property?: string): ParseResult<T> {
  const result: ParseResult<T> = {
    ok: true,
    value,
    issues: [],
  };
  if (property !== undefined) {
    result.property = property;
  }
  return result;
}

/**
 * Create a failed ParseResult.
 *
 * @example
 * ```typescript
 * return parseErr("invalid-value", "Invalid color format");
 * return parseErr("invalid-value", "Invalid hex color", {
 *   suggestion: "Use #RRGGBB format",
 *   property: "color"
 * });
 * ```
 *
 * @public
 */
export function parseErr<T = never>(issue: Issue, property?: string): ParseResult<T> {
  const result: ParseResult<T> = {
    ok: false,
    issues: [issue],
  };
  if (property !== undefined) {
    result.property = property;
  }
  return result;
}

/**
 * Add an issue to a ParseResult (preserves success state).
 *
 * Useful for adding warnings to successful parses.
 *
 * @example
 * ```typescript
 * let result = parseOk(colorIR);
 * result = addIssue(result, warningIssue);
 * // result.ok is still true, but has a warning
 * ```
 *
 * @public
 */
export function addIssue<T>(result: ParseResult<T>, issue: Issue): ParseResult<T> {
  return {
    ...result,
    issues: [...result.issues, issue],
  };
}

/**
 * Creates a new ParseResult failure from an existing one, preserving issues
 * but ensuring the new result has the correct (undefined) value type.
 *
 * Use this when an early parse step fails and you need to forward the error
 * to the parent parser's return type without using `as` casts.
 *
 * @example
 * ```typescript
 * function parseHSL(node: CssValue): ParseResult<HSLColor> {
 *   const hResult = parseComponentH(node);
 *   if (!hResult.ok) return forwardParseErr<HSLColor>(hResult);
 *   // ...
 * }
 * ```
 *
 * @public
 */
export function forwardParseErr<T>(failedResult: ParseResult<unknown>): ParseResult<T> {
  return {
    ok: false,
    issues: failedResult.issues,
    property: failedResult.property,
  };
}

/**
 * Combine multiple ParseResults into one (for list/array parsing).
 *
 * All results must succeed for combined result to succeed.
 * All issues are collected regardless of success/failure.
 *
 * @example
 * ```typescript
 * const results = [parseOk(color1), parseOk(color2)];
 * const combined = combineResults(results);
 * // { ok: true, value: [color1, color2], issues: [] }
 * ```
 *
 * @public
 */
export function combineResults<T>(results: ParseResult<T>[]): ParseResult<T[]> {
  const allOk = results.every((r) => r.ok);
  const values = results.map((r) => r.value).filter((v): v is T => v !== undefined);
  const allIssues = results.flatMap((r) => r.issues);

  if (allOk && values.length === results.length) {
    return {
      ok: true,
      value: values,
      issues: allIssues,
    };
  }

  return {
    ok: false,
    issues: allIssues,
  };
}
