// b_path:: packages/b_generators/src/color/hwb.ts
import { type GenerateResult, addGenerateIssue, generateErr, generateOk, hwbColorSchema } from "@b/types";
import { checkAlpha, checkHue, checkPercentage, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#the-hwb-notation
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = hwbColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "HWBColor",
        property: "color",
      }),
      "hwb-color",
    );
  }

  const { h, w, b, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    checkHue(h, "h", "HWBColor"),
    checkPercentage(w, "w", "HWBColor"),
    checkPercentage(b, "b", "HWBColor"),
    alpha ? checkAlpha(alpha, "alpha", "HWBColor") : undefined,
  );

  // 3. Generate CSS
  let css = `hwb(${cssValueToCss(h)} ${cssValueToCss(w)} ${cssValueToCss(b)}`;

  if (alpha !== undefined) {
    css += ` / ${cssValueToCss(alpha)}`;
  }

  css += ")";
  let result = generateOk(css);

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
