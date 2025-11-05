// b_path:: packages/b_generators/src/color/rgb.ts
import { type GenerateResult, addGenerateIssue, generateErr, generateOk, rgbColorSchema } from "@b/types";
import { checkAlpha, checkRGBComponent, collectWarnings, cssValueToCss, zodErrorToIssues } from "@b/utils";

/**
 * @see https://drafts.csswg.org/css-color/#rgb-functions
 */
export function generate(color: unknown): GenerateResult {
  // 1. Schema validation (structure errors)
  const validation = rgbColorSchema.safeParse(color);
  if (!validation.success) {
    return generateErr(
      zodErrorToIssues(validation.error, {
        typeName: "RGBColor",
        property: "color",
      }),
      "rgb-color",
    );
  }

  const { r, g, b, alpha } = validation.data;

  // 2. Semantic validation (range warnings)
  const warnings = collectWarnings(
    checkRGBComponent(r, "r", "RGBColor"),
    checkRGBComponent(g, "g", "RGBColor"),
    checkRGBComponent(b, "b", "RGBColor"),
    alpha ? checkAlpha(alpha, "alpha", "RGBColor") : undefined,
  );

  // 3. Generate CSS
  const rgbPart = `${cssValueToCss(r)} ${cssValueToCss(g)} ${cssValueToCss(b)}`;

  let result: GenerateResult;
  if (alpha !== undefined) {
    result = generateOk(`rgb(${rgbPart} / ${cssValueToCss(alpha)})`);
  } else {
    result = generateOk(`rgb(${rgbPart})`);
  }

  // 4. Attach warnings
  for (const warning of warnings) {
    result = addGenerateIssue(result, warning);
  }

  return result;
}
