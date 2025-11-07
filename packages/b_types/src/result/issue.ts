// b_path:: packages/b_types/src/result/issue.ts
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
  generate: "invalid-ir" | "missing-required-field" | "unsupported-kind" | "unrecognized-keys" | "invalid-union";
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
 * Location within a CSS source (compatible with css-tree).
 *
 * Represents a single point in the source with offset, line, and column.
 * Line and column are 1-indexed (human-readable), offset is 0-indexed.
 *
 * @public
 */
export interface SourceLocation {
  /** The 0-indexed character offset from the beginning of the source. */
  offset: number;
  /** The 1-indexed line number. */
  line: number;
  /** The 1-indexed column number. */
  column: number;
}

/**
 * Range of locations within a CSS source (compatible with css-tree).
 *
 * Represents a span from start to end location, optionally with source filename.
 *
 * @public
 */
export interface SourceLocationRange {
  /** The source file name. If not provided, it will be set to `<unknown>`. */
  source?: string;
  /** The starting location of the range. */
  start: SourceLocation;
  /** The ending location of the range. */
  end: SourceLocation;
}

/**
 * Issue reported during parsing or generation.
 *
 * Strongly typed for IDE autocomplete and type safety.
 * All fields are intentionally flat (no nested objects) for simplicity.
 *
 * @example
 * ```typescript
 * {
 *   code: "invalid-value",
 *   severity: "error",
 *   message: "Unknown named color 'notacolor'",
 *   property: "color",
 *   location: { start: { line: 1, column: 8 }, end: { line: 1, column: 18 } },
 *   sourceContext: "   1 | color: notacolor\n               ^"
 * }
 * ```
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
  /** Optional location range in input string (for parse errors) */
  location?: SourceLocationRange;
  /** Optional formatted source context with visual pointer to error location */
  sourceContext?: string;
  /** Optional path to error in IR structure (for generation errors) */
  path?: (string | number)[];
  /** Optional expected type or value */
  expected?: string;
  /** Optional received type or value */
  received?: string;
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
    location?: SourceLocationRange;
    sourceContext?: string;
    path?: (string | number)[];
    expected?: string;
    received?: string;
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
    location?: SourceLocationRange;
    sourceContext?: string;
    path?: (string | number)[];
    expected?: string;
    received?: string;
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
    location?: SourceLocationRange;
    sourceContext?: string;
    path?: (string | number)[];
    expected?: string;
    received?: string;
  },
): Issue {
  return {
    code,
    severity: "info",
    message,
    ...options,
  };
}
