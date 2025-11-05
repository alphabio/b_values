// b_path:: src/utils/generate/validation.ts

import type { z } from "zod";
import type { Issue } from "@b/types";

// Use Zod v4 core types (not deprecated)
type ZodIssue = z.core.$ZodIssue;
type ZodError = z.ZodError;
type ZodIssueInvalidUnion = z.core.$ZodIssueInvalidUnion;

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
 * - Adds Zod error code as metadata for advanced filtering
 * - Filters out generic "Invalid input" messages
 *
 * @param zodError - Zod validation error from safeParse()
 * @returns Array of Issue objects with detailed error information and path context
 *
 * @example
 * ```typescript
 * import { zodErrorToIssues } from "@/utils/generate";
 * import { animationDurationSchema } from "@/core/types/animation";
 *
 * const validation = animationDurationSchema.safeParse(input);
 * if (!validation.success) {
 *   const issues = zodErrorToIssues(validation.error);
 *   // issues[0].message: "durations[0].unit: Invalid input: expected \"s\""
 *   // issues[0].path: ["durations", 0, "unit"]
 *   // issues[0].metadata.zodCode: "invalid_literal"
 *   return { ok: false, issues };
 * }
 * ```
 *
 * @public
 */
export function zodErrorToIssues(zodError: ZodError): Issue[] {
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
          const pathStr = formatPath(fullPath);
          const message = pathStr ? `${pathStr}: ${zodIssue.message}` : zodIssue.message;

          issues.push({
            code: "invalid-ir",
            severity: "error",
            message,
          });
          // Don't traverse into union branches - custom message is sufficient
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
        const pathStr = formatPath(fullPath);
        const message = pathStr ? `${pathStr}: ${zodIssue.message}` : zodIssue.message;

        issues.push({
          code: "invalid-ir",
          severity: "error",
          message,
        });
      }
    }
  }

  traverse(zodError.issues);

  // Fallback if no specific errors found
  if (issues.length === 0) {
    issues.push({
      code: "invalid-ir",
      severity: "error",
      message: "Invalid IR structure",
    });
  }

  return issues;
}
