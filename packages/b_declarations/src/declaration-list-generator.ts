// b_path:: packages/b_declarations/src/declaration-list-generator.ts
import { createError, generateOk, type GenerateResult, type Issue } from "@b/types";
import { generateDeclaration } from "./generator";
import type { DeclarationResult } from "./types";

/**
 * Generate CSS declaration list from array of DeclarationResult.
 * Produces semicolon-separated declarations.
 *
 * @param declarations - Array of DeclarationResult to generate from
 * @returns GenerateResult with semicolon-separated string
 *
 * @example
 * ```ts
 * const result = generateDeclarationList([
 *   { property: "color", ir: colorIR },
 *   { property: "font-size", ir: fontSizeIR }
 * ]);
 * // Result: "color: red; font-size: 16px"
 * ```
 */
export function generateDeclarationList(declarations: DeclarationResult[]): GenerateResult {
  // Handle empty array
  if (declarations.length === 0) {
    return generateOk("");
  }

  const results: string[] = [];
  const allIssues: Issue[] = [];

  // Generate each declaration
  for (const decl of declarations) {
    const result = generateDeclaration({
      property: decl.property as never,
      ir: decl.ir as never,
    });

    if (result.ok) {
      results.push(result.value);
    }

    // Also collect warnings from successful generations
    if (result.issues.length > 0) {
      allIssues.push(...result.issues);
    }
  }

  // If no declarations generated successfully, return error
  if (results.length === 0) {
    return {
      ok: false,
      issues: allIssues.length > 0 ? allIssues : [createError("invalid-ir", "Failed to generate any declarations")],
    };
  }

  // Join with semicolons
  const css = results.join("; ");

  return {
    ok: true,
    value: css,
    issues: allIssues,
  };
}
