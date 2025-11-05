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
 * A discriminated union that ensures type safety:
 * - When `ok: true`, `value` is guaranteed to be present (type T)
 * - When `ok: false`, `value` is normally undefined, but can be partially present (type T)
 *   for multi-error collection scenarios
 *
 * Issues array allows warnings + success (parser can succeed with warnings).
 * When `ok: false`, issues contains all collected errors.
 *
 * @example
 * ```typescript
 * import { parseOk, parseErr } from "@b/types";
 *
 * // Success
 * const result = parseOk({ kind: "hex", value: "#FF0000" });
 * if (result.ok) {
 *   console.log(result.value); // ColorIR
 * }
 *
 * // Error (no partial value)
 * const error = parseErr("invalid-value", "Invalid hex color");
 * if (!error.ok) {
 *   console.log(error.issues[0].message);
 * }
 *
 * // Error with partial value (multi-error collection)
 * // Must use explicit type annotation for type safety
 * const partial: ParseResult<BackgroundImageIR> = {
 *   ok: false,
 *   value: { kind: "layers", layers: [successfulLayer1, successfulLayer2] },
 *   issues: [error1, error2, error3]
 * };
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
