// b_path:: packages/b_declarations/src/generator.ts
import { generateOk, generateErr, createError, type GenerateResult, type Issue } from "@b/types";
import { getPropertyDefinition } from "./core";
import type { PropertyIRMap, RegisteredProperty, PropertyGenerator } from "./types";

/**
 * Input for generating a CSS declaration from IR.
 *
 * Generic version allows type-safe property names and IR types.
 */

export interface GenerateDeclarationInput<TProperty extends RegisteredProperty> {
  property: TProperty;
  ir: PropertyIRMap[TProperty];
  important?: boolean;
}

/**
 * Generate a CSS declaration string from its IR representation.
 *
 * @param input - Property name and IR to generate from
 * @returns GenerateResult with CSS declaration string or issues
 *
 * @example
 * ```ts
 * // Type-safe usage
 * const result = generateDeclaration({
 *   property: "background-image" as const,
 *   ir: { kind: "list", layers: [...] }
 * });
 *
 * if (result.ok) {
 *   console.log(result.value); // "background-image: url(img.png), linear-gradient(...)"
 * }
 * ```
 */
export function generateDeclaration<TProperty extends RegisteredProperty>(
  input: GenerateDeclarationInput<TProperty>,
): GenerateResult {
  const { property, ir, important } = input;

  // Look up property definition (with custom property fallback)
  const definition = getPropertyDefinition(property);

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

  // We need to tell TypeScript that the generator we retrieved (which is `(ir: unknown) => ...` at a glance)
  // is the correct one for the IR we have. This is a safe assertion because our registration
  // process will guarantee it.
  const generator = definition.generator as PropertyGenerator<PropertyIRMap[TProperty]>;
  const rawResult = generator(ir);
  const result = ensureProperty(rawResult, property);

  if (!result.ok) {
    return result;
  }

  // Format as CSS declaration: "property: value"
  // Append !important if specified
  const declaration = important ? `${property}: ${result.value} !important` : `${property}: ${result.value}`;

  return {
    ...generateOk(declaration, property),
    issues: result.issues,
  };
}

function ensureProperty(result: GenerateResult, property: string): GenerateResult {
  const stampedIssues = stampIssues(result.issues, property);

  if (result.ok) {
    return {
      ok: true,
      value: result.value,
      issues: stampedIssues,
      property,
    };
  }

  return {
    ok: false,
    issues: stampedIssues,
    property,
  };
}

function stampIssues(issues: Issue[], property: string): Issue[] {
  return issues.map((issue) => (issue.property ? issue : { ...issue, property }));
}
