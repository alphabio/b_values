// b_path:: packages/b_types/src/result/core.ts
/**
 * Core Result type for operations that may fail.
 *
 * Provides a type-safe way to handle errors without throwing exceptions.
 * Inspired by Rust's Result<T, E> and functional programming patterns.
 *
 * @module
 */

/**
 * Result type for operations that may fail.
 *
 * A discriminated union that ensures type safety:
 * - When `ok: true`, `value` is guaranteed to be present (type T)
 * - When `ok: false`, `error` is guaranteed to be present (type E)
 *
 * @example
 * ```typescript
 * import { Result, ok, err } from "@b/types";
 *
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) return err("Division by zero");
 *   return ok(a / b);
 * }
 *
 * const result = divide(10, 2);
 * if (result.ok) {
 *   console.log(result.value); // 5 (type: number)
 * } else {
 *   console.error(result.error); // string
 * }
 * ```
 *
 * @public
 */
export type Result<T, E = Error> = { ok: true; value: T; error: undefined } | { ok: false; value: undefined; error: E };

/**
 * Create a successful result.
 *
 * @example
 * ```typescript
 * const result = ok(42);
 * console.log(result.ok); // true
 * console.log(result.value); // 42
 * console.log(result.error); // undefined
 * ```
 *
 * @public
 */
export function ok<T>(value: T): Result<T, never> {
  return { ok: true, value, error: undefined };
}

/**
 * Create an error result.
 *
 * @example
 * ```typescript
 * const result = err("Something went wrong");
 * console.log(result.ok); // false
 * console.log(result.error); // "Something went wrong"
 * console.log(result.value); // undefined
 * ```
 *
 * @public
 */
export function err<E>(error: E): Result<never, E> {
  return { ok: false, value: undefined, error };
}

/**
 * Convert a Zod SafeParseReturnType to a Result.
 *
 * @example
 * ```typescript
 * import { z } from "zod";
 * import { fromZod } from "@b/types";
 *
 * const schema = z.number();
 * const zodResult = schema.safeParse("not a number");
 * const result = fromZod(zodResult);
 *
 * if (!result.ok) {
 *   console.error(result.error); // ZodError
 * }
 * ```
 *
 * @public
 */
export function fromZod<T, E = unknown>(
  zodResult: { success: true; data: T } | { success: false; error: E },
): Result<T, E> {
  if (zodResult.success) {
    return ok(zodResult.data);
  }
  return err(zodResult.error);
}

/**
 * Unwrap a result, throwing if it's an error.
 * Use sparingly - prefer explicit error handling.
 *
 * @example
 * ```typescript
 * const result = ok(42);
 * const value = unwrap(result); // 42
 *
 * const errorResult = err("Failed");
 * unwrap(errorResult); // throws Error("Failed")
 * ```
 *
 * @public
 */
export function unwrap<T, E>(result: Result<T, E>): T {
  if (result.ok) {
    return result.value;
  }
  throw result.error instanceof Error ? result.error : new Error(String(result.error));
}

/**
 * Get the value or a default if error.
 *
 * @example
 * ```typescript
 * const result = err("Failed");
 * const value = unwrapOr(result, 42); // 42
 * ```
 *
 * @public
 */
export function unwrapOr<T, E>(result: Result<T, E>, defaultValue: T): T {
  return result.ok ? result.value : defaultValue;
}

/**
 * Map over a successful result.
 *
 * @example
 * ```typescript
 * const result = ok(2);
 * const doubled = map(result, x => x * 2);
 * console.log(doubled.value); // 4
 * ```
 *
 * @public
 */
export function map<T, U, E>(result: Result<T, E>, fn: (value: T) => U): Result<U, E> {
  return result.ok ? ok(fn(result.value)) : result;
}

/**
 * Chain results together (flatMap).
 *
 * @example
 * ```typescript
 * const result = ok(2);
 * const doubled = andThen(result, x =>
 *   x > 0 ? ok(x * 2) : err("Must be positive")
 * );
 * ```
 *
 * @public
 */
export function andThen<T, U, E>(result: Result<T, E>, fn: (value: T) => Result<U, E>): Result<U, E> {
  return result.ok ? fn(result.value) : result;
}
