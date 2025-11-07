// b_path:: packages/b_declarations/src/parser.ts
import { createError, createInfo, parseErr, parseOk, forwardParseErr, type ParseResult, type Issue } from "@b/types";
import { validate } from "@b/utils";
import { propertyRegistry } from "./core";
import type { CSSDeclaration, DeclarationResult } from "./types";
import { generateDeclaration } from "./generator";
import * as csstree from "@eslint/css-tree";

/**
 * Parse a CSS declaration string or object into its IR representation.
 *
 * AST-native architecture: Single-pass parsing with direct AST traversal.
 * 1. Parses CSS to AST with css-tree (positions enabled)
 * 2. Passes AST node directly to property parser
 * 3. Errors naturally include location data from AST
 *
 * @param input - CSS declaration string (e.g., "color: red;" or "color: red") or object
 * @returns Result with the parsed IR or an error
 *
 * @example
 * ```ts
 * // From string
 * const result = parseDeclaration("background-image: url(img.png);");
 *
 * // From object
 * const result = parseDeclaration({
 *   property: "background-image",
 *   value: "url(img.png)"
 * });
 * ```
 */
export function parseDeclaration(input: string | CSSDeclaration): ParseResult<DeclarationResult> {
  let property: string;
  let value: string;

  // Parse string input
  if (typeof input === "string") {
    const parsed = parseDeclarationString(input);
    if (!parsed.ok) {
      return forwardParseErr<DeclarationResult>(parsed);
    }
    property = parsed.value.property;
    value = parsed.value.value;
  } else {
    property = input.property;
    value = input.value;
  }

  // Step 1: Look up property definition
  const definition = propertyRegistry.get(property);

  if (!definition) {
    return parseErr(createError("invalid-value", `Unknown CSS property: ${property}`));
  }

  // Step 2: Parse value to AST with positions enabled
  let valueAst: csstree.Value;
  try {
    valueAst = csstree.parse(value, {
      context: "value",
      positions: true,
    }) as csstree.Value;
  } catch (e: unknown) {
    // Fatal parse error from css-tree
    const error = e as Error;
    return parseErr(createError("invalid-syntax", error.message));
  }

  // Step 3: Validate with css-tree for additional warnings
  const validation = validate(`${property}: ${value}`);

  // Step 4: Parse using property's AST-native parser
  const parseResult = definition.parser(valueAst);

  // Step 5: Collect all issues
  const allIssues: Issue[] = [...parseResult.issues];

  // Add css-tree warnings for visual context
  if (validation.warnings.length > 0) {
    const contextIssues = validation.warnings.map((w) =>
      createInfo("invalid-syntax", w.formattedWarning || w.name, {
        property: w.property,
      }),
    );
    allIssues.push(...contextIssues);
  }

  // Step 5: Try generation to get semantic warnings (even if parse failed but has partial IR)
  if (parseResult.value) {
    try {
      // Type assertion needed for generic generateDeclaration signature
      const genResult = generateDeclaration({
        property: property as never,
        ir: parseResult.value as never,
      });

      if (genResult.issues.length > 0) {
        // Add generator warnings (deduplicate by message to avoid duplicates)
        const existingMessages = new Set(allIssues.map((i) => i.message));
        const newIssues = genResult.issues.filter((i) => !existingMessages.has(i.message));
        allIssues.push(...newIssues);
      }
    } catch (_err) {
      // Generator threw - ignore, we still have parse result
    }
  }

  // Step 6: Return result
  if (!parseResult.ok) {
    return {
      ok: false,
      value: parseResult.value as DeclarationResult | undefined,
      issues: allIssues,
      property,
    };
  }

  return {
    ...parseOk({
      property,
      ir: parseResult.value,
      original: value,
    }),
    issues: allIssues,
  };
}

/**
 * Parse a CSS declaration string into property and value.
 * Handles both formats: "property: value;" and "property: value"
 *
 * @internal
 */
function parseDeclarationString(input: string): ParseResult<CSSDeclaration> {
  const trimmed = input.trim();

  // Remove trailing semicolon if present
  const cleaned = trimmed.endsWith(";") ? trimmed.slice(0, -1) : trimmed;

  // Split on first colon
  const colonIndex = cleaned.indexOf(":");

  if (colonIndex === -1) {
    return parseErr(createError("invalid-syntax", `Invalid CSS declaration: missing colon in "${input}"`));
  }

  const property = cleaned.slice(0, colonIndex).trim();
  const value = cleaned.slice(colonIndex + 1).trim();

  if (!property) {
    return parseErr(createError("missing-value", `Invalid CSS declaration: empty property in "${input}"`));
  }

  if (!value) {
    return parseErr(createError("missing-value", `Invalid CSS declaration: empty value in "${input}"`));
  }

  return parseOk({ property, value });
}
