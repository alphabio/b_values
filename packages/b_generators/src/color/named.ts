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
 * @see https://drafts.csswg.org/css-color/#named-colors
 */
export function generate(color: unknown, context?: GenerateContext): GenerateResult {
  // 1. Schema validation - validate object structure (not semantic color name)
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

  const validated = validation.data;

  // 2. Semantic validation - check if it's a known color
  // We can always represent a named color, even if it's not valid
  // Following our philosophy: ok = canRepresent(input), not isValidCSS(input)
  const colorName = validated.name;
  let result = generateOk(colorName);

  // Check if it's a known color name
  const isKnownColor = namedColorsValues.includes(colorName);

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
