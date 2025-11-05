// b_path:: packages/b_generators/src/color/hsl.ts
import { type GenerateResult, addGenerateIssue, generateErr, generateOk, hslColorSchema } from "@b/types";
import { checkAlpha, checkHue, checkPercentage, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#the-hsl-notation
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = hslColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "HSLColor",
        property: "color",
      }),
      "hsl-color",
    );
  }

  const { h, s, l, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    checkHue(h, "h", "HSLColor"),
    checkPercentage(s, "s", "HSLColor"),
    checkPercentage(l, "l", "HSLColor"),
    alpha ? checkAlpha(alpha, "alpha", "HSLColor") : undefined,
  );

  // 3. Generate CSS
  const hslPart = `${cssValueToCss(h)} ${cssValueToCss(s)} ${cssValueToCss(l)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`hsl(${hslPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`hsl(${hslPart})`);
  }

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
