// b_path:: packages/b_generators/src/color/named.ts
import { namedColorsValues } from "@b/keywords";
import { type GenerateResult, type GenerateContext, generateOk, generateErr, addGenerateIssue } from "@b/types";
import { findClosestMatch, zodErrorToIssues } from "@b/utils";
import { z } from "zod";

// Relaxed schema for generation - accepts any string for name
const namedColorGeneratorSchema = z
  .object({
    kind: z.literal("named"),
    name: z.string(), // Accept any string, we'll validate semantically
  })
  .strict();

/**
 * Generate CSS named color string from NamedColor IR.
 *
 * Follows the 4-step generator pattern:
 * 1. Structural validation (Zod schema)
 * 2. Generate CSS string (always succeeds for valid structure)
 * 3. Semantic validation (check if color name is recognized)
 * 4. Attach warnings if needed
 *
 * @see https://drafts.csswg.org/css-color/#named-colors
 */
export function generate(color: unknown, context?: GenerateContext): GenerateResult {
  // Step 1: Structural Validation
  // Validate that the input has the correct shape (object with kind and name)
  const validation = namedColorGeneratorSchema.safeParse(color);

  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "NamedColor",
        property: context?.property ?? "color",
        parentPath: context?.parentPath,
      }),
      "named-color",
    );
  }

  const { name: colorName } = validation.data;

  // Step 2: Generate CSS
  // We can always represent a named color as CSS, even if unrecognized
  // Philosophy: ok = canRepresent(input), not isValidCSS(input)
  let result = generateOk(colorName);

  // Step 3: Semantic Validation
  // Check if it's a recognized CSS named color
  const isKnownColor = namedColorsValues.includes(colorName);

  // Step 4: Attach Warnings
  if (!isKnownColor) {
    const closestMatch = findClosestMatch(colorName, namedColorsValues);

    result = addGenerateIssue(result, {
      code: "invalid-value",
      severity: "warning",
      message: `Unknown named color '${colorName}'`,
      property: context?.property ?? "color",
      suggestion: closestMatch ? `Did you mean '${closestMatch}'?` : "Use a valid CSS named color",
      expected: "Valid named color (e.g., red, blue, green, etc.)",
      received: colorName,
      path: [...(context?.parentPath ?? []), "name"],
    });
  }

  return result;
}
