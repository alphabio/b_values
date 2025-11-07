// b_path:: packages/b_types/src/result/generate.ts
/**
 * GenerateResult type for IR → CSS generation operations.
 *
 * @module
 */

import type { Issue } from "./issue";

/**
 * Context for generation to enable path propagation through nested calls.
 *
 * @example
 * ```typescript
 * const context: GenerateContext = {
 *   parentPath: ["list", 0, "gradient", "colorStops", 0],
 *   property: "background-image"
 * };
 * ```
 *
 * @public
 */
export interface GenerateContext {
  /** Path from root to current position in IR tree */
  parentPath?: (string | number)[];
  /** CSS property being generated */
  property?: string;
}

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
 * Accepts either a single Issue or an array of Issues for multi-error scenarios.
 *
 * @example
 * ```typescript
 * // Single error
 * return generateErr(createError("invalid-ir", "Invalid IR structure"));
 *
 * // Multiple errors from Zod
 * return generateErr(zodErrorToIssues(zodError), "color");
 *
 * // With property
 * return generateErr(createError("missing-required-field", "Missing 'kind'"), "color");
 * ```
 *
 * @public
 */
export function generateErr(issues: Issue | Issue[], property?: string): GenerateResult {
  const result: GenerateResult = {
    ok: false,
    issues: Array.isArray(issues) ? issues : [issues],
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

/**
 * Prepend parent path to all issues in a result.
 *
 * Used when calling nested generators to maintain full path context.
 *
 * @example
 * ```typescript
 * const colorResult = Color.generate(color);
 * const withPath = prependPathToIssues(colorResult, ["colorStops", 0, "color"]);
 * // Issues now have full path from parent context
 * ```
 *
 * @public
 */
export function prependPathToIssues(result: GenerateResult, pathPrefix: (string | number)[]): GenerateResult {
  if (pathPrefix.length === 0) {
    return result;
  }

  const issues = result.issues.map((issue) => ({
    ...issue,
    path: [...pathPrefix, ...(issue.path ?? [])],
  }));

  return {
    ...result,
    issues,
  };
}
