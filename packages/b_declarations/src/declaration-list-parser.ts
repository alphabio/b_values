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
      // TODO: Revisit not sure if this should be an error / not useful to UX
      // maybe a console log instead? It is useful for DX
      allIssues.push(createError("invalid-syntax", `Unexpected node type: ${node.type}`));
      return;
    }

    // Extract property and value from AST node
    const property = node.property;
    const valueNode = node.value;

    // Validate !important syntax
    // css-tree returns true for valid "!important", or the string value for malformed (e.g., "!xxx" → "xxx")
    const importantValue = node.important;
    let important = false;

    if (importantValue) {
      if (importantValue === true) {
        important = true;
      } else {
        // Malformed !important syntax - add error and skip this declaration
        allIssues.push(
          createError("invalid-syntax", `Invalid !important syntax: got "!${importantValue}", expected "!important"`, {
            property,
          }),
        );
        return;
      }
    }

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

  if (hasErrors) {
    return {
      ok: false,
      value: declarations,
      issues: allIssues,
    };
  }

  return {
    ok: true,
    value: declarations,
    issues: allIssues,
  };
}
