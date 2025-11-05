// b_path:: packages/b_utils/src/generate/validation.ts

import type { z } from "zod";
import type { Issue } from "@b/types";
import { findClosestMatch } from "../string/levenshtein";

// Use Zod v4 core types (not deprecated)
type ZodIssue = z.core.$ZodIssue;
type ZodError = z.ZodError;
type ZodIssueInvalidUnion = z.core.$ZodIssueInvalidUnion;
type ZodIssueUnrecognizedKeys = z.core.$ZodIssueUnrecognizedKeys;

/**
 * Context for enhancing Zod error messages with domain-specific information.
 *
 * @public
 */
export interface ZodErrorContext {
  /** Type name being validated (e.g., "RGBColor") */
  typeName?: string;
  /** CSS property name (e.g., "background-color") */
  property?: string;
  /** Parent path for nested structures */
  parentPath?: (string | number)[];
  /** Valid keys for this schema (for typo suggestions) */
  validKeys?: string[];
  /** The actual value that was received (for union errors) */
  receivedValue?: unknown;
}

/**
 * Format a path array into a human-readable string.
 *
 * Converts an array path (e.g., from Zod validation) into dot notation
 * with bracket notation for array indices.
 *
 * @param path - Array of path segments (strings and numbers)
 * @returns Formatted path string
 *
 * @example
 * ```typescript
 * formatPath(["durations", 0, "unit"]) // "durations[0].unit"
 * formatPath(["value"]) // "value"
 * formatPath([]) // ""
 * ```
 *
 * @public
 */
export function formatPath(path: (string | number)[]): string {
  if (path.length === 0) return "";

  return path.reduce<string>((acc, segment, i) => {
    if (typeof segment === "number") return `${acc}[${segment}]`;
    if (i === 0) return String(segment);
    return `${acc}.${segment}`;
  }, "");
}

/**
 * Convert Zod validation errors to b_value Issue format.
 *
 * Zod creates deeply nested error structures for unions and complex schemas.
 * This recursively traverses the error tree and extracts actionable error messages
 * with path context for pinpointing the exact location of validation failures.
 *
 * Features:
 * - Recursively traverses union errors to collect all failures
 * - Includes path context in error messages (e.g., "durations[0].unit: ...")
 * - Preserves path array for programmatic access
 * - Adds expected/received information for type errors
 * - Provides "Did you mean?" suggestions for typos
 * - Filters out generic "Invalid input" messages
 *
 * @param zodError - Zod validation error from safeParse()
 * @param context - Optional context for enhanced error messages
 * @returns Array of Issue objects with detailed error information and path context
 *
 * @example
 * ```typescript
 * import { zodErrorToIssues } from "@/utils/generate";
 * import { rgbColorSchema } from "@/core/types/color";
 *
 * const validation = rgbColorSchema.safeParse(input);
 * if (!validation.success) {
 *   const issues = zodErrorToIssues(validation.error, {
 *     typeName: "RGBColor",
 *     property: "background-color"
 *   });
 *   // Rich error with context, path, and suggestions
 *   return { ok: false, issues };
 * }
 * ```
 *
 * @public
 */
export function zodErrorToIssues(zodError: ZodError, context?: ZodErrorContext): Issue[] {
  const issues: Issue[] = [];

  function traverse(zodIssues: readonly ZodIssue[], parentPath: (string | number)[] = []): void {
    for (const zodIssue of zodIssues) {
      if (zodIssue.code === "invalid_union") {
        const unionIssue = zodIssue as ZodIssueInvalidUnion;

        // If union has a custom message (not generic "Invalid input"), use it and DON'T traverse
        if (zodIssue.message !== "Invalid input") {
          const relativePath = zodIssue.path.filter(
            (p): p is string | number => typeof p === "string" || typeof p === "number",
          );
          const fullPath = [...parentPath, ...relativePath];

          issues.push(createIssue(zodIssue, fullPath, context));
          continue;
        }

        // Generic union error - traverse into all branches to collect specific errors
        const unionPath = [
          ...parentPath,
          ...zodIssue.path.filter((p): p is string | number => typeof p === "string" || typeof p === "number"),
        ];

        if (Array.isArray(unionIssue.errors)) {
          for (const errorGroup of unionIssue.errors) {
            if (Array.isArray(errorGroup)) {
              traverse(errorGroup, unionPath);
            }
          }
        }
      } else {
        // Skip generic "Invalid input" messages without path details
        if (zodIssue.message === "Invalid input" && zodIssue.path.length === 0) {
          continue;
        }

        // Convert path to (string | number)[] - filter out symbols if present
        const relativePath = zodIssue.path.filter(
          (p): p is string | number => typeof p === "string" || typeof p === "number",
        );
        const fullPath = [...parentPath, ...relativePath];

        issues.push(createIssue(zodIssue, fullPath, context));
      }
    }
  }

  traverse(zodError.issues, context?.parentPath);

  // Fallback if no specific errors found
  if (issues.length === 0) {
    issues.push({
      code: "invalid-ir",
      severity: "error",
      message: "Invalid IR structure",
      property: context?.property,
    });
  }

  return issues;
}

/**
 * Create an Issue from a ZodIssue with enhanced context.
 */
function createIssue(zodIssue: ZodIssue, fullPath: (string | number)[], context?: ZodErrorContext): Issue {
  const pathStr = formatPath(fullPath);
  const message = formatZodMessage(zodIssue, pathStr, context);
  const code = mapZodCode(zodIssue.code);

  return {
    code,
    severity: "error",
    message,
    property: context?.property,
    path: fullPath.length > 0 ? fullPath : undefined,
    suggestion: generateSuggestion(zodIssue, context),
    expected: extractExpected(zodIssue, context),
    received: extractReceived(zodIssue, context),
  };
}

/**
 * Map Zod error codes to our IssueCode types.
 */
function mapZodCode(zodCode: string): Issue["code"] {
  const mapping: Record<string, Issue["code"]> = {
    invalid_type: "invalid-ir",
    unrecognized_keys: "unrecognized-keys",
    invalid_union: "invalid-union",
    too_small: "missing-required-field",
    too_big: "invalid-value",
    invalid_literal: "invalid-value",
    invalid_enum_value: "invalid-value",
  };
  return mapping[zodCode] ?? "invalid-ir";
}

/**
 * Format Zod message with context.
 */
function formatZodMessage(issue: ZodIssue, pathStr: string, context?: ZodErrorContext): string {
  const typeStr = context?.typeName ? ` in ${context.typeName}` : "";

  switch (issue.code) {
    case "invalid_type": {
      const expected = "expected" in issue ? String(issue.expected) : "unknown";
      const received = "received" in issue ? String(issue.received) : "unknown";

      if (received === "undefined") {
        return pathStr ? `Missing required field at '${pathStr}'${typeStr}` : `Missing required field${typeStr}`;
      }
      return pathStr
        ? `Invalid type at '${pathStr}'${typeStr}: expected ${expected}, got ${received}`
        : `Invalid type${typeStr}: expected ${expected}, got ${received}`;
    }

    case "unrecognized_keys": {
      const keysIssue = issue as ZodIssueUnrecognizedKeys;
      const keys = keysIssue.keys.map((k) => `'${String(k)}'`).join(", ");
      return pathStr
        ? `Unrecognized key(s) at '${pathStr}'${typeStr}: ${keys}`
        : `Unrecognized key(s)${typeStr}: ${keys}`;
    }

    default:
      return pathStr ? `${pathStr}: ${issue.message}` : issue.message;
  }
}

/**
 * Generate actionable suggestions for fixing errors.
 */
function generateSuggestion(issue: ZodIssue, context?: ZodErrorContext): string | undefined {
  switch (issue.code) {
    case "invalid_type": {
      const expected = "expected" in issue ? String(issue.expected) : "unknown";
      const received = "received" in issue ? String(issue.received) : "unknown";

      if (received === "undefined") {
        const field = issue.path[issue.path.length - 1];
        const fieldStr = field ? String(field) : "This field";
        return `'${fieldStr}' is required`;
      }
      return `Expected ${expected}, received ${received}`;
    }

    case "unrecognized_keys": {
      const keysIssue = issue as ZodIssueUnrecognizedKeys;
      const unknownKey = keysIssue.keys[0];
      const unknownKeyStr = unknownKey ? String(unknownKey) : undefined;

      if (unknownKeyStr && context?.validKeys) {
        const suggestion = findClosestMatch(unknownKeyStr, context.validKeys);
        if (suggestion) {
          return `Did you mean '${suggestion}'?`;
        }
      }

      return "Check for typos in key name";
    }

    case "invalid_union": {
      // For union errors, try to suggest closest match
      if (context?.receivedValue && context?.validKeys && context.validKeys.length > 0) {
        const receivedStr = String(context.receivedValue);
        const suggestion = findClosestMatch(receivedStr, context.validKeys);
        if (suggestion) {
          return `Did you mean '${suggestion}'?`;
        }
      }

      // Fallback: show first few valid options
      if (context?.validKeys && context.validKeys.length > 0) {
        const preview = context.validKeys.slice(0, 5).join(", ");
        const more = context.validKeys.length > 5 ? `... (${context.validKeys.length - 5} more)` : "";
        return `Must be one of: ${preview}${more}`;
      }

      return undefined;
    }

    default:
      return undefined;
  }
}

/**
 * Extract expected value/type from ZodIssue.
 */
function extractExpected(issue: ZodIssue, context?: ZodErrorContext): string | undefined {
  if ("expected" in issue) {
    return String(issue.expected);
  }

  // For union errors, show valid options if available
  if (issue.code === "invalid_union" && context?.validKeys && context.validKeys.length > 0) {
    const preview = context.validKeys.slice(0, 3).join(" | ");
    const more = context.validKeys.length > 3 ? ` | ... (${context.validKeys.length} total)` : "";
    return preview + more;
  }

  return undefined;
}

/**
 * Extract received value/type from ZodIssue.
 */
function extractReceived(issue: ZodIssue, context?: ZodErrorContext): string | undefined {
  if ("received" in issue) {
    return String(issue.received);
  }

  // For union errors, use the received value from context if available
  if (issue.code === "invalid_union" && context?.receivedValue !== undefined) {
    return String(context.receivedValue);
  }

  return undefined;
}
