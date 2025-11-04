// b_path:: packages/b_types/src/result/generate.ts
/**
 * GenerateResult type for IR → CSS generation operations.
 *
 * @module
 */

import type { Issue } from "./issue";

/**
 * Result of generating CSS from intermediate representation.
 *
 * A discriminated union that ensures type safety:
 * - When `ok: true`, `value` is guaranteed to be present (CSS string)
 * - When `ok: false`, `value` is undefined
 *
 * Issues array allows warnings + success (generator can succeed with warnings).
 *
 * @example
 * ```typescript
 * import { generateOk, generateErr } from "@b/types";
 *
 * // Success
 * const result = generateOk("#ff0000");
 * if (result.ok) {
 *   console.log(result.value); // "#ff0000"
 * }
 *
 * // Error
 * const error = generateErr(createError("invalid-ir", "Missing required field"));
 * if (!error.ok) {
 *   console.log(error.issues[0].message);
 * }
 * ```
 *
 * @public
 */
export type GenerateResult =
  | { ok: true; value: string; property?: string; issues: Issue[] }
  | { ok: false; value?: undefined; property?: string; issues: Issue[] };

/**
 * Create a successful GenerateResult.
 *
 * @example
 * ```typescript
 * return generateOk("#ff0000");
 * return generateOk("#ff0000", "color");  // with property
 * ```
 *
 * @public
 */
export function generateOk(value: string, property?: string): GenerateResult {
  const result: GenerateResult = {
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
 * Create a failed GenerateResult.
 *
 * @example
 * ```typescript
 * return generateErr(createError("invalid-ir", "Invalid IR structure"));
 * return generateErr(createError("missing-required-field", "Missing 'kind'"), "color");
 * ```
 *
 * @public
 */
export function generateErr(issue: Issue, property?: string): GenerateResult {
  const result: GenerateResult = {
    ok: false,
    issues: [issue],
  };
  if (property !== undefined) {
    result.property = property;
  }
  return result;
}

/**
 * Add an issue to a GenerateResult (preserves success state).
 *
 * Useful for adding warnings to successful generation.
 *
 * @example
 * ```typescript
 * let result = generateOk("#ff0000");
 * result = addGenerateIssue(result, warningIssue);
 * // result.ok is still true, but has a warning
 * ```
 *
 * @public
 */
export function addGenerateIssue(result: GenerateResult, issue: Issue): GenerateResult {
  return {
    ...result,
    issues: [...result.issues, issue],
  };
}

/**
 * Combine multiple GenerateResults into one (for list/array generation).
 *
 * All results must succeed for combined result to succeed.
 * All issues are collected regardless of success/failure.
 * CSS strings are joined with separator (default: ", ").
 *
 * @example
 * ```typescript
 * const results = [generateOk("red"), generateOk("blue")];
 * const combined = combineGenerateResults(results);
 * // { ok: true, value: "red, blue", issues: [] }
 *
 * // Custom separator
 * const spaced = combineGenerateResults(results, " ");
 * // { ok: true, value: "red blue", issues: [] }
 * ```
 *
 * @public
 */
export function combineGenerateResults(results: GenerateResult[], separator = ", "): GenerateResult {
  const allOk = results.every((r) => r.ok);
  const values = results.map((r) => r.value).filter((v): v is string => v !== undefined);
  const allIssues = results.flatMap((r) => r.issues);

  if (allOk && values.length === results.length) {
    return {
      ok: true,
      value: values.join(separator),
      issues: allIssues,
    };
  }

  return {
    ok: false,
    issues: allIssues,
  };
}
