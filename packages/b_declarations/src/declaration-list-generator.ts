// b_path:: packages/b_declarations/src/declaration-list-generator.ts
import { createError, generateOk, type GenerateResult, type Issue } from "@b/types";
import { generateDeclaration } from "./generator";
import type { AnyDeclarationInput } from "./types";

/**
 * Generate CSS declaration list from array of typed declaration inputs.
 * Produces semicolon-separated declarations.
 *
 * @param declarations - Array of typed declarations to generate from
 * @returns GenerateResult with semicolon-separated string
 *
 * @example
 */
export function generateDeclarationList(declarations: AnyDeclarationInput[]): GenerateResult {
  // Handle empty array
  if (declarations.length === 0) {
    return generateOk("");
  }

  const results: string[] = [];
  const allIssues: Issue[] = [];

  // Generate each declaration
  for (const decl of declarations) {
    const result = generateDeclaration(decl);

    if (result.ok) {
      results.push(result.value);
    }

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
