// b_path:: packages/b_generators/src/color/oklch.ts
import { type GenerateResult, addGenerateIssue, generateErr, generateOk, oklchColorSchema } from "@b/types";
import { checkAlpha, checkHue, checkLiteralRange, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#ok-lch
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = oklchColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "OKLCHColor",
        property: "color",
      }),
      "oklch-color",
    );
  }

  const { l, c, h, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    checkLiteralRange(l, 0, 1, { field: "l", typeName: "OKLCHColor" }),
    checkLiteralRange(c, 0, 0.4, { field: "c", typeName: "OKLCHColor" }),
    checkHue(h, "h", "OKLCHColor"),
    alpha ? checkAlpha(alpha, "alpha", "OKLCHColor") : undefined,
  );

  // 3. Generate CSS
  const oklchPart = `${cssValueToCss(l)} ${cssValueToCss(c)} ${cssValueToCss(h)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`oklch(${oklchPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`oklch(${oklchPart})`);
  }

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
