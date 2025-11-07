// b_path:: packages/b_declarations/src/parser.ts
import {
  createError,
  parseErr,
  parseOk,
  forwardParseErr,
  type ParseResult,
  type Issue,
  type GenerateResult,
} from "@b/types";
import { getPropertyDefinition, isCustomProperty } from "./core";
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

  // Parse string input into property and value components
  // Accepts two formats:
  // 1. String: "property: value" or "property: value;"
  // 2. Object: { property: "property", value: "value" }
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

  // Step 1: Look up property definition (with custom property fallback)
  const definition = getPropertyDefinition(property);

  if (!definition) {
    return parseErr(createError("invalid-value", `Unknown CSS property: ${property}`));
  }

  // Step 2: Parse based on property type
  let parseResult: ParseResult<unknown>;

  // Special case: Custom properties (--*) receive raw string to preserve formatting
  if (isCustomProperty(property)) {
    parseResult = unsafeCallParser(definition.parser, value);
  } else if (definition.multiValue) {
    // Multi-value property: Pass raw string to parser (will split on commas)
    parseResult = unsafeCallParser(definition.parser, value);
  } else {
    // Single-value property: Parse to AST first
    let valueAst: csstree.Value;
    try {
      valueAst = csstree.parse(value, {
        context: "value",
        positions: true,
      }) as csstree.Value;
    } catch (e: unknown) {
      // Fatal syntax error for single-value property
      const error = e as Error;
      return parseErr(createError("invalid-syntax", error.message));
    }

    // Pass validated AST to parser
    parseResult = unsafeCallParser(definition.parser, valueAst);
  }

  // Step 3: Collect all issues
  const allIssues: Issue[] = [...parseResult.issues];

  // Step 4: Try generation to get semantic warnings (even if parse failed but has partial IR)
  if (parseResult.value) {
    try {
      const genResult = unsafeGenerateDeclaration(property, parseResult.value);

      if (genResult.issues.length > 0) {
        // Add generator warnings (deduplicate by message to avoid duplicates)
        const existingMessages = new Set(allIssues.map((issue) => issue.message));
        const newIssues = genResult.issues.filter((issue) => !existingMessages.has(issue.message));
        allIssues.push(...newIssues);
      }
    } catch (_err) {
      // Generator threw - ignore, we still have parse result
    }
  }

  // Step 5: Enrich all issues with property context
  const enrichedIssues = allIssues.map((issue) => ({
    ...issue,
    property,
  }));

  // Step 6: Return result
  if (!parseResult.ok) {
    return {
      ok: false,
      value: parseResult.value as DeclarationResult | undefined,
      issues: enrichedIssues,
      property,
    };
  }

  return {
    ...parseOk({
      property,
      ir: parseResult.value,
      original: value,
    }),
    issues: enrichedIssues,
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

/**
 * Internal unsafe dispatch function for calling property parsers.
 *
 * This function isolates the `as never` type assertion required because TypeScript
 * cannot connect a dynamic property string to the specific parser signature.
 *
 * **⚠️ TYPE SAFETY BOUNDARY:**
 * The risk is that the parser and input might not match. This is mitigated by:
 * - PropertyRegistry ensures parsers are registered with correct types
 * - Runtime multiValue check ensures correct input type (string vs AST)
 * - This function makes the type-safety boundary explicit and auditable
 *
 * @internal
 */
function unsafeCallParser(parser: unknown, input: unknown): ParseResult<unknown> {
  // The `as never` cast is necessary here. The parser function signature is generic,
  // but we're calling it with a dynamically determined input type.
  // We cast both parser and input to bypass TypeScript's strict type checking.
  return (parser as (input: never) => ParseResult<unknown>)(input as never);
}

/**
 * Internal unsafe dispatch function for calling generateDeclaration.
 *
 * This function isolates the `as never` type assertion required because TypeScript
 * cannot infer the generic TProperty type from a runtime string value.
 *
 * **⚠️ TYPE SAFETY BOUNDARY:**
 * The risk is that property and IR might not match. This is mitigated by:
 * - The IR was just parsed by the property's parser, so it should match
 * - PropertyRegistry ensures type consistency at registration time
 * - This function makes the type-safety boundary explicit and auditable
 *
 * @internal
 */
function unsafeGenerateDeclaration(property: string, ir: unknown): GenerateResult {
  // The `as never` casts are necessary here. TypeScript cannot connect
  // the runtime string `property` to the specific generic type TProperty.
  return generateDeclaration({
    property: property as never,
    ir: ir as never,
  });
}
