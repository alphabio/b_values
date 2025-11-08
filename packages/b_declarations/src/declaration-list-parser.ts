// b_path:: packages/b_declarations/src/declaration-list-parser.ts
import { createError, createWarning, parseErr, parseOk, type ParseResult, type Issue } from "@b/types";
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
    return parseErr(
      "declaration-list",
      createError("invalid-syntax", `Failed to parse declaration list: ${error.message}`),
    );
  }

  // Collect results and issues
  const declarations: DeclarationResult[] = [];
  const allIssues: Issue[] = [];
  const seenProperties = new Set<string>();

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
    const important = Boolean(node.important);

    if (!valueNode) {
      allIssues.push(createError("missing-value", `Missing value for property: ${property}`, { property }));
      return;
    }

    const value = csstree.generate(valueNode).trim();

    // Parse the declaration using existing infrastructure
    const result = parseDeclaration({ property, value, important });

    if (result.ok) {
      // Check for duplicate property
      if (seenProperties.has(property)) {
        allIssues.push(
          createWarning("duplicate-property", `Property "${property}" declared multiple times. Last value wins.`, {
            property,
          }),
        );
      }
      seenProperties.add(property);
      declarations.push(result.value);
    }

    // Collect all issues (both errors and warnings)
    allIssues.push(...result.issues);
  });

  const hasErrors = allIssues.some((issue) => issue.severity === "error");

  // If we have declarations AND no errors, it's a success.
  // If we have no declarations but also no issues, it's an empty-but-valid success.
  if ((declarations.length > 0 && !hasErrors) || (declarations.length === 0 && allIssues.length === 0)) {
    return {
      ok: true,
      value: declarations,
      issues: allIssues,
    };
  }

  // Otherwise, it's a failure (either partial or total).
  return {
    ok: false,
    value: declarations, // Still return partial value
    issues: allIssues,
  };
}
