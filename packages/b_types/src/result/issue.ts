/**
 * Issue tracking for parse and generate operations.
 *
 * Provides structured error and warning reporting with strongly-typed codes.
 *
 * @module
 */

/**
 * Issue code categories for extensibility.
 *
 * Uses interface merging to allow packages to extend issue codes.
 * Each category maps to specific issue code strings.
 *
 * @public
 */
export interface IssueCodeMap {
  parse: "invalid-value" | "invalid-syntax" | "missing-value";
  generate: "invalid-ir" | "missing-required-field" | "unsupported-kind";
  warning: "duplicate-property" | "deprecated-syntax" | "legacy-syntax";
}

/**
 * Union of all issue codes.
 *
 * Packages can extend IssueCodeMap via module augmentation to add custom codes.
 *
 * @example
 * ```typescript
 * // In b_parsers package
 * declare module "@b/types" {
 *   interface IssueCodeMap {
 *     parse: "invalid-gradient" | "invalid-color";
 *   }
 * }
 * ```
 *
 * @public
 */
export type IssueCode = IssueCodeMap[keyof IssueCodeMap];

/**
 * Source location in input string.
 *
 * Used for parse errors to point to specific characters.
 *
 * @public
 */
export interface SourceLocation {
  /** Zero-based offset from start of input */
  offset: number;
  /** Number of characters */
  length: number;
}

/**
 * Issue reported during parsing or generation.
 *
 * Strongly typed for IDE autocomplete and type safety.
 * All fields are intentionally flat (no nested objects) for simplicity.
 *
 * @public
 */
export interface Issue {
  /** Issue code for categorization */
  code: IssueCode;
  /** Severity level */
  severity: "error" | "warning" | "info";
  /** Human-readable message */
  message: string;
  /** Optional CSS property name that caused the issue */
  property?: string;
  /** Optional suggestion for fixing the issue */
  suggestion?: string;
  /** Optional location in input string (for parse errors) */
  location?: SourceLocation;
}

/**
 * Create an error issue.
 *
 * @example
 * ```typescript
 * const issue = createError("invalid-value", "Invalid hex color");
 * ```
 *
 * @public
 */
export function createError(
  code: IssueCode,
  message: string,
  options?: {
    property?: string;
    suggestion?: string;
    location?: SourceLocation;
  },
): Issue {
  return {
    code,
    severity: "error",
    message,
    ...options,
  };
}

/**
 * Create a warning issue.
 *
 * @example
 * ```typescript
 * const issue = createWarning("deprecated-syntax", "Use modern syntax", {
 *   suggestion: "Replace with new syntax"
 * });
 * ```
 *
 * @public
 */
export function createWarning(
  code: IssueCode,
  message: string,
  options?: {
    property?: string;
    suggestion?: string;
    location?: SourceLocation;
  },
): Issue {
  return {
    code,
    severity: "warning",
    message,
    ...options,
  };
}

/**
 * Create an info issue.
 *
 * @example
 * ```typescript
 * const issue = createInfo("legacy-syntax", "Consider updating syntax");
 * ```
 *
 * @public
 */
export function createInfo(
  code: IssueCode,
  message: string,
  options?: {
    property?: string;
    suggestion?: string;
    location?: SourceLocation;
  },
): Issue {
  return {
    code,
    severity: "info",
    message,
    ...options,
  };
}
