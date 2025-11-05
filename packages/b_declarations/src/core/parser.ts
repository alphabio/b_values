// b_path:: packages/b_declarations/src/core/parser.ts
import { ok, err, type Result } from "@b/types";
import { propertyRegistry } from "./registry";
import type { CSSDeclaration, DeclarationResult } from "./types";

/**
 * Parse a CSS declaration string or object into its IR representation.
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
export function parseDeclaration(input: string | CSSDeclaration): Result<DeclarationResult, string> {
  let property: string;
  let value: string;

  // Parse string input
  if (typeof input === "string") {
    const parsed = parseDeclarationString(input);
    if (!parsed.ok) {
      return parsed;
    }
    property = parsed.value.property;
    value = parsed.value.value;
  } else {
    property = input.property;
    value = input.value;
  }

  // Look up property definition
  const definition = propertyRegistry.get(property);

  if (!definition) {
    return err(`Unknown CSS property: ${property}`);
  }

  // Parse the value using the property's parser
  const parseResult = definition.parser(value);

  if (!parseResult.ok) {
    return err(`Failed to parse ${property}: ${parseResult.error}`);
  }

  return ok({
    property,
    ir: parseResult.value,
    original: value,
  });
}

/**
 * Parse a CSS declaration string into property and value.
 * Handles both formats: "property: value;" and "property: value"
 *
 * @internal
 */
function parseDeclarationString(input: string): Result<CSSDeclaration, string> {
  const trimmed = input.trim();

  // Remove trailing semicolon if present
  const cleaned = trimmed.endsWith(";") ? trimmed.slice(0, -1) : trimmed;

  // Split on first colon
  const colonIndex = cleaned.indexOf(":");

  if (colonIndex === -1) {
    return err(`Invalid CSS declaration: missing colon in "${input}"`);
  }

  const property = cleaned.slice(0, colonIndex).trim();
  const value = cleaned.slice(colonIndex + 1).trim();

  if (!property) {
    return err(`Invalid CSS declaration: empty property in "${input}"`);
  }

  if (!value) {
    return err(`Invalid CSS declaration: empty value in "${input}"`);
  }

  return ok({ property, value });
}
