// b_path:: packages/b_declarations/src/generator.ts
import { generateOk, generateErr, createError, type GenerateResult } from "@b/types";
import { propertyRegistry } from "./registry";
import type { CSSDeclaration } from "./types";

/**
 * Input for generating a CSS declaration from IR.
 */
export interface GenerateDeclarationInput {
  property: string;
  ir: unknown;
}

/**
 * Generate a CSS declaration string from its IR representation.
 *
 * @param input - Property name and IR to generate from
 * @returns GenerateResult with CSS declaration string or issues
 *
 * @example
 * ```ts
 * const result = generateDeclaration({
 *   property: "background-image",
 *   ir: { kind: "layers", layers: [...] }
 * });
 *
 * if (result.ok) {
 *   console.log(result.value); // "background-image: url(img.png), linear-gradient(...)"
 * }
 * ```
 */
export function generateDeclaration(input: GenerateDeclarationInput): GenerateResult {
  const { property, ir } = input;

  // Look up property definition
  const definition = propertyRegistry.get(property);

  if (!definition) {
    return generateErr(
      createError("invalid-ir", `Unknown CSS property: ${property}`, {
        property,
        suggestion: "Check property name spelling or ensure property is registered",
      }),
      property,
    );
  }

  // Check if property has a generator
  if (!definition.generator) {
    return generateErr(
      createError("missing-required-field", `Property ${property} does not have a generator registered`, {
        property,
        suggestion: "Add a generator function to the property definition",
      }),
      property,
    );
  }

  // Generate the value using the property's generator
  const generateResult = definition.generator(ir);

  if (!generateResult.ok) {
    return generateResult;
  }

  // Format as CSS declaration: "property: value"
  const declaration = `${property}: ${generateResult.value}`;

  return generateOk(declaration, property);
}

/**
 * Generate a CSS declaration object from IR.
 * Returns { property, value } instead of formatted string.
 *
 * @param input - Property name and IR to generate from
 * @returns GenerateResult with CSSDeclaration object or issues
 *
 * @example
 * ```ts
 * const result = generateDeclarationObject({
 *   property: "background-image",
 *   ir: { kind: "layers", layers: [...] }
 * });
 *
 * if (result.ok) {
 *   console.log(result.value); // { property: "background-image", value: "url(...)" }
 * }
 * ```
 */
export function generateDeclarationObject(input: GenerateDeclarationInput): GenerateResult {
  const { property, ir } = input;

  // Look up property definition
  const definition = propertyRegistry.get(property);

  if (!definition) {
    return generateErr(
      createError("invalid-ir", `Unknown CSS property: ${property}`, {
        property,
        suggestion: "Check property name spelling or ensure property is registered",
      }),
      property,
    );
  }

  // Check if property has a generator
  if (!definition.generator) {
    return generateErr(
      createError("missing-required-field", `Property ${property} does not have a generator registered`, {
        property,
        suggestion: "Add a generator function to the property definition",
      }),
      property,
    );
  }

  // Generate the value using the property's generator
  const generateResult = definition.generator(ir);

  if (!generateResult.ok) {
    return generateResult;
  }

  // Return as object (useful for serialization)
  const declaration: CSSDeclaration = {
    property,
    value: generateResult.value,
  };

  return {
    ok: true,
    value: JSON.stringify(declaration),
    property,
    issues: generateResult.issues,
  };
}
