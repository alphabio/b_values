// b_path:: packages/b_generators/src/color/oklab.ts
import { type GenerateResult, addGenerateIssue, generateErr, generateOk, oklabColorSchema } from "@b/types";
import { checkAlpha, checkLiteralRange, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lab
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = oklabColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "OKLABColor",
        property: "color",
      }),
      "oklab-color",
    );
  }

  const { l, a, b, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    checkLiteralRange(l, 0, 1, { field: "l", typeName: "OKLABColor" }),
    checkLiteralRange(a, -0.4, 0.4, { field: "a", typeName: "OKLABColor" }),
    checkLiteralRange(b, -0.4, 0.4, { field: "b", typeName: "OKLABColor" }),
    alpha ? checkAlpha(alpha, "alpha", "OKLABColor") : undefined,
  );

  // 3. Generate CSS
  const oklabPart = `${cssValueToCss(l)} ${cssValueToCss(a)} ${cssValueToCss(b)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`oklab(${oklabPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`oklab(${oklabPart})`);
  }

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
