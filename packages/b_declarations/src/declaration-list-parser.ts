// b_path:: packages/b_declarations/src/declaration-list-parser.ts
import { createError, parseErr, parseOk, type ParseResult, type Issue } from "@b/types";
import { parseDeclaration } from "./parser";
import type { DeclarationResult } from "./types";
import * as csstree from "@eslint/css-tree";

/**
 * Parse a CSS declaration list (semicolon-separated declarations).
 * Commonly used for inline styles or batch parsing.
 *
 * Handles partial failures: continues parsing on invalid declarations,
 * collects all successful results and all issues.
 *
 * @param css - Declaration list string (no braces)
 * @returns ParseResult with array of DeclarationResult
 *
 * @example
 * ```ts
 * const result = parseDeclarationList("color: red; font-size: 16px; margin: 10px");
 * if (result.ok) {
 *   console.log(`Parsed ${result.value.length} declarations`);
 * }
 * ```
 */
export function parseDeclarationList(css: string): ParseResult<DeclarationResult[]> {
  const trimmed = css.trim();

  // Handle empty input
  if (trimmed === "") {
    return parseOk([]);
  }

  // Parse with css-tree using declarationList context
  let ast: csstree.DeclarationList;
  try {
    ast = csstree.parse(trimmed, {
      context: "declarationList",
      positions: true,
    }) as csstree.DeclarationList;
  } catch (e: unknown) {
    const error = e as Error;
    return parseErr(createError("invalid-syntax", `Failed to parse declaration list: ${error.message}`));
  }

  // Collect results and issues
  const declarations: DeclarationResult[] = [];
  const allIssues: Issue[] = [];

  // Iterate over declaration nodes
  if (!ast.children) {
    return parseOk([]);
  }

  ast.children.forEach((node) => {
    if (node.type !== "Declaration") {
      allIssues.push(createError("invalid-syntax", `Unexpected node type: ${node.type}`));
      return;
    }

    // Extract property and value from AST node
    const property = node.property;
    const valueNode = node.value;

    if (!valueNode) {
      allIssues.push(createError("missing-value", `Missing value for property: ${property}`, { property }));
      return;
    }

    // Generate CSS string from value node
    const value = csstree.generate(valueNode);

    // Parse the declaration using existing infrastructure
    const result = parseDeclaration({ property, value });

    if (result.ok) {
      declarations.push(result.value);
    }

    // Collect all issues (both errors and warnings)
    allIssues.push(...result.issues);
  });

  // Return results with all issues
  // Success if we parsed at least one declaration, or if input was valid but empty
  if (declarations.length > 0 || allIssues.length === 0) {
    return {
      ok: true,
      value: declarations,
      issues: allIssues,
    };
  }

  // Failed if no declarations parsed and we have errors
  return {
    ok: false,
    value: declarations,
    issues: allIssues,
  };
}
