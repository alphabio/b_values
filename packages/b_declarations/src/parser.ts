// b_path:: packages/b_declarations/src/parser.ts
import * as csstree from "@eslint/css-tree";
import * as Keywords from "@b/keywords";
import { createError, parseErr, parseOk, type ParseResult, type Issue, type GenerateResult } from "@b/types";
import { getPropertyDefinition, isCustomProperty } from "./core";
import type { CSSDeclaration, DeclarationResult } from "./types";
import { generateDeclaration } from "./generator";

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
  let important = false;

  // Parse string input into property and value components
  // Accepts two formats:
  // 1. String: "property: value" or "property: value;"
  // 2. Object: { property: "property", value: "value" }
  if (typeof input === "string") {
    const parsed = parseDeclarationString(input);
    if (!parsed.ok) {
      // Enrich issues with property context before returning
      const enrichedIssues = parsed.issues.map((issue) => ({
        ...issue,
        property: parsed.property,
      }));
      return {
        ok: false,
        issues: enrichedIssues,
        property: parsed.property,
      };
    }
    property = parsed.value.property;
    value = parsed.value.value;
    important = parsed.value.important ?? false;
  } else {
    property = input.property;
    value = input.value;
    important = Boolean(input.important);
  }

  // ✨ UNIVERSAL CSS-WIDE KEYWORD CHECK ✨
  // CSS-wide keywords (inherit, initial, unset, revert, revert-layer) are universal
  // and apply to ALL properties. Check once here instead of in every property parser.
  // This is architecturally correct: browsers handle these keywords at the top level
  // before delegating to property-specific parsing logic.

  if (!isCustomProperty(property)) {
    const trimmedValue = value.trim().toLowerCase();
    const wideKeywordCheck = Keywords.cssWide.safeParse(trimmedValue);
    if (wideKeywordCheck.success) {
      return parseOk({
        property,
        ir: { kind: "keyword", value: wideKeywordCheck.data } as never,
        ...(important ? { important: true } : {}),
      });
    }
  } // ✨ END UNIVERSAL CHECK ✨

  // Step 1: Look up property definition (with custom property fallback)
  const definition = getPropertyDefinition(property);

  if (!definition) {
    return parseErr(property, { ...createError("invalid-value", `Unknown CSS property: ${property}`), property });
  }

  // Step 2: Pre-validate keywords if allowedKeywords is defined
  const preValidationIssues: Issue[] = [];

  if (definition.allowedKeywords && !isCustomProperty(property)) {
    const trimmedValue = value.trim().toLowerCase();

    // For multi-value properties, validate each comma-separated value
    if (definition.multiValue) {
      const values = trimmedValue.split(/\s*,\s*/);
      for (const val of values) {
        // Only validate bare identifiers - skip CSS functions (var, calc, etc)
        if (val && /^[a-z-]+$/i.test(val) && !definition.allowedKeywords.includes(val)) {
          preValidationIssues.push(
            createError(
              "invalid-value",
              `Invalid keyword '${val}' for ${property}. Expected one of: ${definition.allowedKeywords.join(", ")}`,
            ),
          );
        }
      }
    } else {
      // Single-value keyword property - only validate bare identifiers
      if (/^[a-z-]+$/i.test(trimmedValue) && !definition.allowedKeywords.includes(trimmedValue)) {
        preValidationIssues.push(
          createError(
            "invalid-value",
            `Invalid keyword '${trimmedValue}' for ${property}. Expected one of: ${definition.allowedKeywords.join(", ")}`,
          ),
        );
      }
    }
  }

  // Step 3: Parse based on property type
  let parseResult: ParseResult<unknown>;

  // Dispatch to appropriate parser based on property definition
  if (definition.rawValue) {
    // Raw value properties: Pass string directly without AST parsing
    // Examples: custom properties (--*), intentionally opaque values
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
      return parseErr(property, createError("invalid-syntax", error.message));
    }

    // Pass validated AST to parser
    parseResult = unsafeCallParser(definition.parser, valueAst);
  }

  // Step 4: Collect all issues
  const allIssues: Issue[] = [...preValidationIssues, ...parseResult.issues];

  // Step 5: Try generation to get semantic warnings (even if parse failed but has partial IR)
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

  // Step 6: Enrich all issues with property context
  const enrichedIssues = allIssues.map((issue) => ({
    ...issue,
    property,
  }));

  // Step 7: Return result
  if (!parseResult.ok) {
    const partialDeclaration =
      parseResult.value !== undefined
        ? withImportant<DeclarationResult>({ property, ir: parseResult.value as never }, important)
        : undefined;

    return {
      ok: false,
      value: partialDeclaration,
      issues: enrichedIssues,
      property,
    };
  }

  return {
    ...parseOk(withImportant<DeclarationResult>({ property, ir: parseResult.value as never }, important)),
    issues: enrichedIssues,
  };
}

/**
 * Parse a CSS declaration string into property and value.
 * Handles both formats: "property: value;" and "property: value"
 *
 * Uses css-tree for consistent parsing with parseDeclarationList.
 * This ensures proper handling of !important and malformed syntax.
 *
 * @internal
 */
function parseDeclarationString(input: string): ParseResult<CSSDeclaration> {
  const trimmed = input.trim();

  // Remove trailing semicolon if present for css-tree
  const cleaned = trimmed.endsWith(";") ? trimmed.slice(0, -1) : trimmed;

  // Parse with css-tree using declaration context
  let ast: csstree.Declaration;
  try {
    ast = csstree.parse(cleaned, {
      context: "declaration",
      positions: true,
    }) as csstree.Declaration;
  } catch (e: unknown) {
    const error = e as Error;
    return parseErr("declaration", createError("invalid-syntax", error.message));
  }

  // Extract property, value, and important from AST
  const property = ast.property;
  const valueNode = ast.value;

  // Validate !important syntax
  // css-tree returns true for valid "!important", or the string value for malformed (e.g., "!xxx" → "xxx")
  const importantValue = ast.important;
  let important = false;

  if (importantValue) {
    if (importantValue === true) {
      important = true;
    } else {
      // Malformed !important syntax
      return parseErr(
        property,
        createError("invalid-syntax", `Invalid !important syntax: got "!${importantValue}", expected "!important"`),
      );
    }
  }

  if (!valueNode) {
    return parseErr(property, createError("missing-value", `Missing value for property: ${property}`));
  }

  const value = csstree.generate(valueNode).trim();

  if (!value) {
    return parseErr(property, createError("missing-value", `Empty value for property: ${property}`));
  }

  return parseOk({ property, value, important });
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

/**
 * Conditionally adds the important flag to a declaration result.
 * Only adds the field if important is true.
 *
 * @internal
 */
function withImportant<T extends DeclarationResult>(decl: T, important: boolean): T {
  return important ? { ...decl, important: true } : decl;
}
