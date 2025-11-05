// b_path:: packages/b_generators/src/color/lab.ts
import { type GenerateResult, addGenerateIssue, generateErr, generateOk, labColorSchema } from "@b/types";
import { checkAlpha, checkLiteralRange, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#lab-colors
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = labColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "LABColor",
        property: "color",
      }),
      "lab-color",
    );
  }

  const { l, a, b, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    checkLiteralRange(l, 0, 100, { field: "l", typeName: "LABColor" }),
    checkLiteralRange(a, -125, 125, { field: "a", typeName: "LABColor" }),
    checkLiteralRange(b, -125, 125, { field: "b", typeName: "LABColor" }),
    alpha ? checkAlpha(alpha, "alpha", "LABColor") : undefined,
  );

  // 3. Generate CSS
  const labPart = `${cssValueToCss(l)} ${cssValueToCss(a)} ${cssValueToCss(b)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`lab(${labPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`lab(${labPart})`);
  }

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
